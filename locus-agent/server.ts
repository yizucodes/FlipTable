import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { query } from '@anthropic-ai/claude-agent-sdk';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Configuration for Locus MCP connection
const getBuyerLocusMCPConfig = () => ({
  'locus': {
    type: 'http' as const,
    url: 'https://mcp.paywithlocus.com/mcp',
    headers: {
      'Authorization': `Bearer ${process.env.LOCUS_API_KEY_SENDER}`
    }
  }
});

// Buyer agent options - has access to payment tools
const getBuyerAgentOptions = () => {
  const config = getBuyerLocusMCPConfig();
  
  if (!process.env.LOCUS_API_KEY_SENDER) {
    console.warn('⚠️  Warning: LOCUS_API_KEY_SENDER not set. MCP connection will fail.');
  }
  
  return {
    mcpServers: config,
    allowedTools: [
      'mcp__locus__*',
      'mcp__list_resources',
      'mcp__read_resource'
    ],
    apiKey: process.env.ANTHROPIC_API_KEY!,
    canUseTool: async (toolName: string, input: Record<string, unknown>) => {
      console.log(`\n🔐 Tool authorization check: ${toolName}`);
      
      if (toolName.startsWith('mcp__locus__')) {
        console.log(`   ✅ Allowed: ${toolName}`);
        console.log(`   📝 Input:`, JSON.stringify(input, null, 2));
        return {
          behavior: 'allow' as const,
          updatedInput: input
        };
      }
      console.log(`   ❌ Denied: ${toolName}`);
      return {
        behavior: 'deny' as const,
        message: 'Only Locus payment tools are allowed'
      };
    }
  };
};

// Extract text response from agent message and track tools called
async function getAgentResponse(
  agentQuery: AsyncIterable<any>,
  agentName: string
): Promise<{ response: string; toolsCalled: Array<{ name: string; input: any; result?: any }> }> {
  let response = '';
  let toolsCalled: Array<{ name: string; input: any; result?: any }> = [];
  
  for await (const message of agentQuery) {
    const msgType = message.type;
    const msgSubtype = (message as any).subtype;
    
    // Debug: log all message types and handle assistant/user messages
    if (!['system', 'tool_use', 'tool_result', 'content_block', 'content_block_delta', 'content_block_start', 'result', 'error_during_execution', 'error', 'assistant', 'user'].includes(msgType)) {
      console.log(`🔍 Unknown message type: ${msgType}`);
    }
    
    // Handle assistant messages that might contain tool_use blocks
    if (msgType === 'assistant' || msgType === 'user') {
      // Check if this message contains tool uses
      const toolUses = (message as any).tool_uses || (message as any).content?.filter((c: any) => c.type === 'tool_use') || [];
      if (toolUses.length > 0) {
        for (const toolUse of toolUses) {
          const toolName = toolUse.name || toolUse.function?.name;
          const toolInput = toolUse.input || toolUse.function?.arguments || {};
          const toolId = toolUse.id;
          
          if (toolName) {
            toolsCalled.push({ name: toolName, input: typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput });
            console.log(`\n🔧 Using tool (from ${msgType}): ${toolName}`);
            console.log(`   Tool ID: ${toolId || 'N/A'}`);
            console.log(`   Input:`, JSON.stringify(typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput, null, 2));
          }
        }
      }
      
      // Check if message content contains tool_use
      if ((message as any).content && Array.isArray((message as any).content)) {
        for (const contentItem of (message as any).content) {
          if (contentItem.type === 'tool_use') {
            const toolName = contentItem.name || contentItem.function?.name;
            const toolInput = contentItem.input || contentItem.function?.arguments || {};
            const toolId = contentItem.id;
            
            if (toolName) {
              toolsCalled.push({ name: toolName, input: typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput });
              console.log(`\n🔧 Using tool (from content): ${toolName}`);
              console.log(`   Tool ID: ${toolId || 'N/A'}`);
              console.log(`   Input:`, JSON.stringify(typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput, null, 2));
            }
          }
        }
      }
    }
    
    if (msgType === 'system' && msgSubtype === 'init') {
      const mcpServersInfo = (message as any).mcp_servers;
      const mcpStatus = mcpServersInfo?.find((s: any) => s.name === 'locus');
      if (mcpStatus) {
        if (mcpStatus.status === 'connected') {
          console.log(`✓ Connected to Locus MCP server`);
          // Log available tools
          if (mcpStatus.tools && Array.isArray(mcpStatus.tools)) {
            const toolNames = mcpStatus.tools.map((t: any) => t.name || t).join(', ');
            console.log(`  Available Locus tools: ${toolNames}`);
          }
        } else {
          console.warn(`⚠️  MCP server status: ${mcpStatus.status || 'unknown'}`);
          if (mcpStatus.error) {
            console.warn(`  Error: ${mcpStatus.error}`);
          }
        }
      }
    } else if (msgType === 'tool_use' || (msgType === 'content_block' && (message as any).content_block?.type === 'tool_use')) {
      const toolUse = (message as any).tool_use || (message as any).content_block || message;
      const toolName = toolUse.name || (message as any).name;
      const toolInput = toolUse.input || (message as any).input;
      const toolId = toolUse.id || (message as any).id;
      
      toolsCalled.push({ name: toolName, input: toolInput });
      console.log(`\n🔧 Using tool: ${toolName}`);
      console.log(`   Tool ID: ${toolId || 'N/A'}`);
      console.log(`   Input:`, JSON.stringify(toolInput, null, 2));
    } else if (msgType === 'tool_result' || (msgType === 'content_block' && (message as any).content_block?.type === 'tool_result')) {
      const toolResult = (message as any).tool_result || (message as any).content_block || message;
      const toolId = toolResult.tool_use_id || toolResult.id || (message as any).tool_use_id;
      const resultContent = toolResult.content || toolResult.result || toolResult.text || (message as any).result || '';
      
      // Find the tool call and add result
      const toolCall = toolsCalled.find(t => t.name && !t.result);
      if (toolCall) {
        let resultText = '';
        if (Array.isArray(resultContent)) {
          resultText = resultContent.map((c: any) => {
            if (typeof c === 'string') return c;
            if (c?.text) return c.text;
            if (typeof c === 'object') return JSON.stringify(c, null, 2);
            return String(c);
          }).join('\n');
        } else if (typeof resultContent === 'string') {
          resultText = resultContent;
        } else if (resultContent && typeof resultContent === 'object') {
          resultText = JSON.stringify(resultContent, null, 2);
        }
        toolCall.result = resultText;
        console.log(`\n✅ Tool result (ID: ${toolId || 'unknown'}):`);
        console.log(`   ${resultText || '(No result)'}`);
      }
    } else if (msgType === 'content_block' && (message as any).content_block) {
      // Handle content_block that might contain tool results
      const contentBlock = (message as any).content_block;
      if (contentBlock.type === 'tool_result') {
        const toolId = contentBlock.tool_use_id || contentBlock.id;
        const resultContent = contentBlock.content || contentBlock.result || '';
        
        let resultText = '';
        if (Array.isArray(resultContent)) {
          resultText = resultContent.map((c: any) => c.text || c || '').join('\n');
        } else if (typeof resultContent === 'string') {
          resultText = resultContent;
        }
        
        const toolCall = toolsCalled.find(t => t.name && !t.result);
        if (toolCall) {
          toolCall.result = resultText;
        }
        console.log(`\n✅ Tool result (content_block, ID: ${toolId || 'unknown'}):`);
        console.log(`   ${resultText || '(No result)'}`);
      }
    } else if (msgType === 'result' && msgSubtype === 'success') {
      response = (message as any).result || response;
      console.log(`\n✅ Result (success): ${response.substring(0, 200)}...`);
    } else if (msgType === 'content_block_delta' && (message as any).delta?.text) {
      const text = (message as any).delta.text;
      process.stdout.write(text);
      response += text;
    } else if (msgType === 'content_block_start') {
      const contentBlock = (message as any).content_block;
      if (contentBlock?.type === 'text' && contentBlock.text) {
        process.stdout.write(contentBlock.text);
        response += contentBlock.text;
      }
    } else if (msgType === 'error_during_execution' || msgType === 'error') {
      const error = (message as any).error || message;
      console.error(`\n⚠️ Agent error:`);
      console.error(`   Type: ${msgType}`);
      if (error.message) {
        console.error(`   Message: ${error.message}`);
      }
      if (error.tool_use_id || (message as any).tool_use_id) {
        console.error(`   Tool that failed: ${error.tool_use_id || (message as any).tool_use_id}`);
      }
      console.error(`   Full error:`, JSON.stringify(error, null, 2));
    }
  }
  
  if (toolsCalled.length > 0) {
    console.log(`\n📋 Tools called: ${toolsCalled.map(t => t.name).join(', ')}`);
  } else {
    console.log(`\n⚠️  No tools were called by the agent`);
  }
  
  console.log('─'.repeat(60));
  console.log(`📥 Agent response: ${response.substring(0, 300)}${response.length > 300 ? '...' : ''}`);
  console.log('─'.repeat(60));
  
  return { response: response.trim(), toolsCalled };
}

// Process payment using Claude agent with Locus MCP
async function processPaymentWithAgent(
  amount: number,
  recipientAddress: string,
  memo: string
): Promise<{ success: boolean; transactionId?: string; message: string; toolsCalled: Array<{ name: string; input: any; result?: any }> }> {
  const buyerOptions = getBuyerAgentOptions();
  
  const paymentPrompt = `You need to complete a payment transaction. The order has been confirmed and you must make the payment now.

CRITICAL INSTRUCTIONS - You MUST call BOTH tools in sequence:

STEP 1: Call the "mcp__locus__get_payment_context" tool (no parameters needed) to check your balance.

STEP 2: IMMEDIATELY after getting the result from step 1, call the "mcp__locus__send_to_address" tool with these EXACT parameters:
{
  "address": "${recipientAddress}",
  "amount": ${amount.toFixed(2)},
  "memo": "${memo}"
}

VERY IMPORTANT:
- You MUST call BOTH tools in sequence - do not skip either step
- Do NOT stop after calling get_payment_context - proceed immediately to send_to_address
- Do NOT provide any text response until BOTH tool calls are complete
- Do NOT analyze or explain - just execute the tool calls
- The send_to_address tool will handle validation and return appropriate errors if needed
- Call both tools NOW before responding with any text

Available tool names (use exactly as written):
- mcp__locus__get_payment_context
- mcp__locus__send_to_address`;

  try {
    console.log('\n📤 Sending payment prompt to Claude agent...');
    console.log('─'.repeat(60));
    
    const queryStream = query({
      prompt: paymentPrompt,
      options: buyerOptions
    });
    
    const result = await getAgentResponse(queryStream, 'Buyer');
    const toolsCalled = result.toolsCalled;
    
    console.log(`\n📥 Agent response received`);
    console.log(`   Tools called: ${toolsCalled.length}`);
    console.log(`   Tool names: ${toolsCalled.map(t => t.name).join(', ') || 'none'}`);
    console.log('─'.repeat(60));
    
    // First, try to extract transaction ID from response (payment might have succeeded)
    const transactionIdFromResponse = extractTransactionId(result.response);
    
    // Check if send_to_address was actually called OR if we have a transaction ID in response
    const sendToAddressCall = toolsCalled.find(t => 
      t.name === 'mcp__locus__send_to_address' || 
      t.name.includes('send_to_address')
    );
    
    // If we have a transaction ID in the response, payment likely succeeded
    if (transactionIdFromResponse && (result.response.includes('success') || result.response.includes('queued') || result.response.includes('Transaction ID'))) {
      console.log(`\n✅ Payment appears successful based on response!`);
      console.log(`   Transaction ID found: ${transactionIdFromResponse}`);
      console.log(`   Agent response indicates success`);
      
      return {
        success: true,
        transactionId: transactionIdFromResponse,
        message: `Payment successful. Transaction ID: ${transactionIdFromResponse}`,
        toolsCalled
      };
    }
    
    if (!sendToAddressCall) {
      console.log('\n⚠️  send_to_address tool was NOT tracked in toolsCalled array.');
      console.log(`   Tools tracked: ${toolsCalled.length > 0 ? toolsCalled.map(t => t.name).join(', ') : 'NONE'}`);
      console.log(`   Agent response: ${result.response.substring(0, 200)}${result.response.length > 200 ? '...' : ''}`);
      
      // Check if response indicates success even though tool wasn't tracked
      if (transactionIdFromResponse || result.response.toLowerCase().includes('success') || result.response.toLowerCase().includes('queued')) {
        console.log(`\n✅ Payment appears successful despite tool tracking issue!`);
        console.log(`   Transaction ID: ${transactionIdFromResponse || 'found in response'}`);
        
        return {
          success: true,
          transactionId: transactionIdFromResponse || undefined,
          message: `Payment successful. Transaction ID: ${transactionIdFromResponse || 'see agent response'}`,
          toolsCalled
        };
      }
      
      console.log('\n🔄 Retrying with more explicit instructions...');
      
      // Check what tools were actually called
      const getContextCall = toolsCalled.find(t => t.name.includes('get_payment_context'));
      if (getContextCall && getContextCall.result) {
        console.log(`   Balance check result: ${getContextCall.result.substring(0, 200)}`);
      } else {
        console.log(`   ⚠️  get_payment_context was also NOT tracked`);
      }
      
      // Retry with more explicit instructions
      const retryPrompt = `You already checked your balance using get_payment_context. Now you MUST complete the payment.

CRITICAL: Call the "mcp__locus__send_to_address" tool RIGHT NOW with these EXACT parameters:
{
  "address": "${recipientAddress}",
  "amount": ${amount.toFixed(2)},
  "memo": "${memo}"
}

Do NOT:
- Check balance again
- Explain anything
- Provide text response
- Wait or hesitate

DO THIS:
- Execute the mcp__locus__send_to_address tool call IMMEDIATELY
- Use the exact parameters shown above
- Wait for the tool result before responding`;

      const retryStream = query({
        prompt: retryPrompt,
        options: buyerOptions
      });
      
      const retryResult = await getAgentResponse(retryStream, 'Buyer');
      const retrySendCall = retryResult.toolsCalled.find(t => 
        t.name === 'mcp__locus__send_to_address' || 
        t.name.includes('send_to_address')
      );
      
      // Check retry response for transaction ID
      const retryTransactionId = extractTransactionId(retryResult.response);
      
      if (retrySendCall || (retryTransactionId && (retryResult.response.includes('success') || retryResult.response.includes('queued')))) {
        const finalTransactionId = retrySendCall?.result ? extractTransactionId(retrySendCall.result) : retryTransactionId;
        
        console.log(`\n✅ Payment successful on retry!`);
        console.log(`   Transaction ID: ${finalTransactionId || 'found in response'}`);
        
        return {
          success: true,
          transactionId: finalTransactionId || undefined,
          message: `Payment successful. Transaction ID: ${finalTransactionId || 'see agent response'}`,
          toolsCalled: [...toolsCalled, ...retryResult.toolsCalled]
        };
      }
      
      console.log(`\n❌ Payment tool still not tracked after retry`);
      console.log(`   Tools tracked on retry: ${retryResult.toolsCalled.map(t => t.name).join(', ') || 'none'}`);
      console.log(`   Retry response: ${retryResult.response.substring(0, 200)}`);
      
      // Final check - if response has transaction ID, consider it success
      if (retryTransactionId || retryResult.response.toLowerCase().includes('success') || retryResult.response.toLowerCase().includes('queued')) {
        return {
          success: true,
          transactionId: retryTransactionId || undefined,
          message: `Payment appears successful. Transaction ID: ${retryTransactionId || 'see response'}`,
          toolsCalled: [...toolsCalled, ...retryResult.toolsCalled]
        };
      }
      
      return {
        success: false,
        message: 'Payment tool was not tracked after multiple attempts, but payment may have succeeded. Check agent response for transaction ID.',
        toolsCalled: [...toolsCalled, ...retryResult.toolsCalled]
      };
    }
    
    // Extract transaction ID from result
    const transactionId = extractTransactionId(sendToAddressCall.result || result.response);
    
    return {
      success: transactionId ? true : false,
      transactionId: transactionId || undefined,
      message: transactionId 
        ? `Payment successful. Transaction ID: ${transactionId}`
        : 'Payment attempted but transaction ID not found in response.',
      toolsCalled
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Payment failed: ${errorMessage}`,
      toolsCalled: []
    };
  }
}

// Extract transaction ID from tool result
function extractTransactionId(result: string): string | null {
  if (!result || typeof result !== 'string') return null;
  
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(result);
    if (parsed.transaction_id) return parsed.transaction_id;
    if (parsed.id) return parsed.id;
    if (parsed.tx_id) return parsed.tx_id;
  } catch {
    // Not JSON, continue with regex
  }
  
  // Try regex patterns - ordered by specificity
  const patterns = [
    // UUID format: 54298166-8079-447c-8439-b91793733948
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    // Transaction ID: after "Transaction ID:" or "transaction_id"
    /transaction[_\s-]?id[":\s]+([a-zA-Z0-9_-]+)/i,
    /transaction[_\s-]?id[":\s]+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // TX ID
    /tx[_\s-]?id[":\s]+([a-zA-Z0-9_-]+)/i,
    // Ethereum transaction hash
    /0x[a-fA-F0-9]{64}/,
    // Generic ID in quotes or after colon
    /id[":\s]+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Any UUID format
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Long alphanumeric ID (32-64 chars)
    /[a-zA-Z0-9]{32,64}/
  ];
  
  for (const pattern of patterns) {
    const match = result.match(pattern);
    if (match) {
      // Return capture group 1 if it exists, otherwise full match
      return match[1] || match[0];
    }
  }
  
  return null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'locus-payment-api' });
});

// Payment endpoint
app.post('/api/payment', async (req, res) => {
  try {
    const { amount, recipient_address, memo, recipient } = req.body;
    
    // Validate required fields
    if (!amount || !recipient_address) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: amount and recipient_address are required'
      });
    }
    
    // Validate environment variables
    if (!process.env.LOCUS_API_KEY_SENDER) {
      return res.status(500).json({
        status: 'error',
        message: 'LOCUS_API_KEY_SENDER not configured'
      });
    }
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'ANTHROPIC_API_KEY not configured'
      });
    }
    
    const paymentMemo = memo || `Payment for ${recipient || 'order'} - Order #${Date.now()}`;
    
    console.log(`\n💳 Processing payment:`);
    console.log(`   Amount: $${amount}`);
    console.log(`   Recipient: ${recipient_address}`);
    console.log(`   Memo: ${paymentMemo}`);
    console.log('─'.repeat(60));
    
    // Process payment with Claude agent
    const result = await processPaymentWithAgent(
      parseFloat(amount),
      recipient_address,
      paymentMemo
    );
    
    console.log(`\n✅ Payment result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.transactionId) {
      console.log(`   Transaction ID: ${result.transactionId}`);
    }
    console.log(`   Message: ${result.message}`);
    console.log('─'.repeat(60));
    
    if (result.success && result.transactionId) {
      res.json({
        status: 'success',
        transaction_id: result.transactionId,
        amount: amount.toString(),
        recipient: recipient || 'Unknown',
        timestamp: new Date().toISOString(),
        message: result.message
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: result.message,
        tools_called: result.toolsCalled.map(t => t.name)
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Payment error:', errorMessage);
    res.status(500).json({
      status: 'error',
      message: errorMessage
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Locus Payment API Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Payment endpoint: POST http://localhost:${PORT}/api/payment`);
});

