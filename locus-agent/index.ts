import 'dotenv/config';
import { query } from '@anthropic-ai/claude-agent-sdk';

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

const getSellerLocusMCPConfig = () => ({
  'locus': {
    type: 'http' as const,
    url: 'https://mcp.paywithlocus.com/mcp',
    headers: {
      'Authorization': `Bearer ${process.env.LOCUS_API_KEY_RECEIVER}`
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

// Platform agent options - no payment tools, just negotiation
const getPlatformAgentOptions = () => ({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  canUseTool: async () => ({
    behavior: 'deny' as const,
    message: 'Platform agent does not use tools'
  })
});

// Extract text response from agent message
async function getAgentResponse(
  agentQuery: AsyncIterable<any>,
  agentName: string,
  prompt?: string
): Promise<{ response: string; toolsCalled: Array<{ name: string; input: any }> }> {
  let response = '';
  let toolsCalled: Array<{ name: string; input: any }> = [];
  
  // Print agent header and sent message if provided
  if (agentName === 'Buyer') {
    console.log('\n🛒 BUYER AGENT:');
  } else if (agentName === 'Platform') {
    console.log('\n🍽️  PLATFORM AGENT:');
  }
  
  if (prompt) {
    console.log(`📤 SENT TO ${agentName.toUpperCase()}:`);
    console.log(prompt);
    console.log('─'.repeat(60));
  }
  
  for await (const message of agentQuery) {
    // Debug: log all message types to understand structure
    const msgType = message.type;
    const msgSubtype = (message as any).subtype;
    
    // Debug: log unknown message types
    if (!['system', 'tool_use', 'tool_result', 'content_block', 'content_block_delta', 'content_block_start', 'result', 'error_during_execution', 'error'].includes(msgType)) {
      console.log(`\n🔍 Unknown message type: ${msgType}`, JSON.stringify(message, null, 2));
    }
    
    if (msgType === 'system' && msgSubtype === 'init') {
        const mcpServersInfo = (message as any).mcp_servers;
      const mcpStatus = mcpServersInfo?.find((s: any) => s.name === 'locus');
      if (agentName === 'Buyer' && mcpStatus) {
        if (mcpStatus.status === 'connected') {
          console.log(`✓ Buyer agent connected to Locus MCP server`);
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
      console.log(`\n🔧 ${agentName} using tool: ${toolName}`);
      console.log(`   Tool ID: ${toolId || 'N/A'}`);
      console.log(`   Input:`, JSON.stringify(toolInput, null, 2));
    } else if (msgType === 'tool_result' || (msgType === 'content_block' && (message as any).content_block?.type === 'tool_result')) {
      const toolResult = (message as any).tool_result || (message as any).content_block || message;
      const toolId = toolResult.tool_use_id || toolResult.id || (message as any).tool_use_id;
      const resultContent = toolResult.content || toolResult.result || toolResult.text || (message as any).result || '';
      
      // Try to extract text from content array
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
      
      console.log(`\n✅ Tool result (ID: ${toolId || 'unknown'}):`);
      console.log(`   ${resultText || '(No result)'}`);
      
      // Also append to response if it's relevant
      if (resultText) {
        response += `\n\nTool Result: ${resultText}`;
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
        
        console.log(`\n✅ Tool result (content_block, ID: ${toolId || 'unknown'}):`);
        console.log(`   ${resultText || '(No result)'}`);
        
        if (resultText) {
          response += `\n\nTool Result: ${resultText}`;
        }
      }
    } else if (msgType === 'result' && msgSubtype === 'success') {
      response = (message as any).result || response;
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
      console.error(`\n⚠️ ${agentName} agent error:`);
      console.error(`   Type: ${msgType}`);
      if (error.message) {
        console.error(`   Message: ${error.message}`);
      }
      if (error.tool_use_id || (message as any).tool_use_id) {
        console.error(`   Tool that failed: ${error.tool_use_id || (message as any).tool_use_id}`);
      }
      if (error.stack) {
        console.error(`   Stack: ${error.stack}`);
      }
      // Log full error for debugging
      console.error(`   Full error:`, JSON.stringify(error, null, 2));
    }
  }
  
  console.log('\n');
  
  if (toolsCalled.length > 0) {
    console.log(`📋 Tools called by ${agentName}: ${toolsCalled.map(t => t.name).join(', ')}`);
  }
  
  console.log('─'.repeat(60));
  console.log(`📥 RESPONSE FROM ${agentName.toUpperCase()}:`);
  console.log(response || '(No response text)');
  console.log('─'.repeat(60));
  
  return { response: response.trim(), toolsCalled };
}

// Run buyer agent query
async function buyerAgentQuery(prompt: string): Promise<string> {
  const result = await buyerAgentQueryWithTools(prompt);
  return result.response;
}

async function buyerAgentQueryWithTools(prompt: string): Promise<{ response: string; toolsCalled: Array<{ name: string; input: any }> }> {
  const buyerOptions = getBuyerAgentOptions();
  const queryStream = query({
    prompt,
    options: buyerOptions
  });
  
  return await getAgentResponse(queryStream, 'Buyer', prompt);
}

// Run platform agent query
async function platformAgentQuery(prompt: string): Promise<string> {
  const platformOptions = getPlatformAgentOptions();
  const queryStream = query({
    prompt,
    options: platformOptions
  });
  
  const result = await getAgentResponse(queryStream, 'Platform', prompt);
  return result.response;
}

// Main conversation loop
async function runAgentConversation(): Promise<void> {
  console.log('🚀 Starting Agent Conversation System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Initialize conversation
  const conversationHistory: Array<{ role: 'buyer' | 'platform', message: string }> = [];
  let turnCount = 0;
  const maxTurns = 15;
  let agreedToPay = false;
  let finalPrice = 0;
  let foodItem = '';
  
  // Buyer starts the conversation
  const buyerInitialPrompt = `You are a hungry customer looking to order food. You want to:
1. Greet the platform agent and ask what food items are available
2. Get prices for the items
3. Negotiate if needed
4. Agree to pay when you're satisfied with the price

Start by greeting the platform agent and asking about available food items. Be friendly and specific about what you're looking for.`;

  let buyerMessage = await buyerAgentQuery(buyerInitialPrompt);
  conversationHistory.push({ role: 'buyer', message: buyerMessage });

  // Platform responds
  let platformResponse = await platformAgentQuery(`
You are a food platform agent selling meals. You have the following menu:
- Pizza: $0.15
- Burger: $0.12
- Pasta: $0.13
- Salad: $0.10
- Sandwich: $0.11

Your role is to:
1. Greet customers warmly when they contact you
2. Present the menu when asked
3. Answer questions about items
4. Negotiate prices (you can offer small discounts, max 10% off)
5. Confirm the order when customer agrees to pay
6. Wait for the customer to make the payment

A customer just said: "${buyerMessage}"

Respond appropriately. When the customer agrees to pay for an item, say: "Great! The total is $X.XX for [item]. Please proceed with the payment using your payment tools."
`);

  conversationHistory.push({ role: 'platform', message: platformResponse });

  // Continue conversation
  while (turnCount < maxTurns && !agreedToPay) {
    turnCount++;
    
    // Check if buyer agreed to pay
    const lowerBuyerMessage = buyerMessage.toLowerCase();
    if (lowerBuyerMessage.includes('agree') || 
        lowerBuyerMessage.includes('yes') || 
        lowerBuyerMessage.includes('proceed') ||
        lowerBuyerMessage.includes('okay') ||
        lowerBuyerMessage.includes('ok') ||
        lowerBuyerMessage.includes('sounds good')) {
      
      // Extract price and item from conversation
      const priceMatch = platformResponse.match(/\$(\d+\.?\d*)/);
      if (priceMatch) {
        finalPrice = parseFloat(priceMatch[1]);
      }
      
      // Extract food item
      const itemMatch = platformResponse.match(/(pizza|burger|pasta|salad|sandwich)/i);
      if (itemMatch) {
        foodItem = itemMatch[1];
      }
      
      agreedToPay = true;
      break;
    }
    
    // Platform responds
    const platformContext = conversationHistory
      .map(h => `${h.role === 'buyer' ? 'Customer' : 'Platform'}: ${h.message}`)
      .join('\n');
    
    platformResponse = await platformAgentQuery(`
You are continuing a conversation with a customer. Here's the conversation so far:

${platformContext}

Customer just said: "${buyerMessage}"

Respond appropriately. If they agree to pay, clearly state: "Great! The total is $X.XX for [item]. Please proceed with the payment."
`);
    
    conversationHistory.push({ role: 'platform', message: platformResponse });
    
    if (turnCount >= maxTurns - 1) break;
    
    // Buyer responds
    const buyerContext = conversationHistory
      .map(h => `${h.role === 'buyer' ? 'You (Buyer)' : 'Platform Agent'}: ${h.message}`)
      .join('\n');
    
    buyerMessage = await buyerAgentQuery(`
You are a customer in a conversation with a food platform. Here's the conversation:

${buyerContext}

Platform agent just said: "${platformResponse}"

Continue the conversation. If you agree to pay, say so clearly. You have access to Locus payment tools:
- get_payment_context: Check your balance
- send_to_address: Send USDC to any wallet address
- send_to_email: Send USDC via email escrow

When ready to pay, first check your payment context, then use send_to_address to make the payment to the platform's wallet address.
`);
    
    conversationHistory.push({ role: 'buyer', message: buyerMessage });
    
    // Check again for agreement
    const lowerMsg = buyerMessage.toLowerCase();
    if (lowerMsg.includes('agree') || 
        lowerMsg.includes('yes') || 
        lowerMsg.includes('proceed') ||
        lowerMsg.includes('okay') ||
        lowerMsg.includes('ok')) {
      agreedToPay = true;
      const priceMatch = platformResponse.match(/\$(\d+\.?\d*)/);
      if (priceMatch) {
        finalPrice = parseFloat(priceMatch[1]);
      }
      const itemMatch = platformResponse.match(/(pizza|burger|pasta|salad|sandwich)/i);
      if (itemMatch) {
        foodItem = itemMatch[1];
      }
      break;
    }
  }
  
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (agreedToPay && finalPrice > 0) {
    console.log(`\n💰 AGREEMENT REACHED!`);
    console.log(`   Item: ${foodItem || 'Food item'}`);
    console.log(`   Price: $${finalPrice.toFixed(2)}`);
    console.log(`\n🔄 Initiating payment process...\n`);
    
    // Validate wallet address exists
    const receiverWalletAddress = process.env.LOCUS_WALLET_ADDRESS_RECEIVER;
    if (!receiverWalletAddress) {
      console.error('\n❌ Error: LOCUS_WALLET_ADDRESS_RECEIVER environment variable is required for payment');
      return;
    }
    
    // Buyer agent checks payment context and makes payment
    const orderMemo = `Payment for ${foodItem || 'food order'} - Order #${Date.now()}`;
    const paymentPrompt = `The platform agent confirmed the order. You agreed to pay $${finalPrice.toFixed(2)} for ${foodItem || 'food'}.

CRITICAL INSTRUCTIONS - You MUST call BOTH tools in sequence:

STEP 1: Call "mcp__locus__get_payment_context" tool (no parameters needed)

STEP 2: IMMEDIATELY after getting the result, call "mcp__locus__send_to_address" tool with these EXACT parameters:
{
  "address": "${receiverWalletAddress}",
  "amount": ${finalPrice.toFixed(2)},
  "memo": "${orderMemo}"
}

VERY IMPORTANT:
- You MUST call BOTH tools, even if the balance check shows insufficient funds
- Do NOT stop after calling get_payment_context
- Do NOT analyze or respond with text until BOTH tool calls are complete
- The send_to_address tool will handle validation and return appropriate errors if needed
- Execute both tool calls NOW before responding with any text

Tool names (use exactly as written):
- "mcp__locus__get_payment_context"
- "mcp__locus__send_to_address"`;

    console.log('\n💳 PAYMENT PROMPT:');
    console.log(paymentPrompt);
    console.log('─'.repeat(60));
    
    const paymentResult = await buyerAgentQueryWithTools(paymentPrompt);
    const paymentResponse = paymentResult.response;
    const toolsCalled = paymentResult.toolsCalled;
    
    // Check if send_to_address was actually called
    const sendToAddressCalled = toolsCalled.some(t => 
      t.name === 'mcp__locus__send_to_address' || 
      t.name.includes('send_to_address')
    );
    
    console.log(`\n📋 Tools called during payment: ${toolsCalled.map(t => t.name).join(', ')}`);
    
    if (!sendToAddressCalled) {
      console.log('\n⚠️  send_to_address tool was NOT called. Retrying with more explicit instructions...\n');
      
      const retryPrompt = `You need to complete the payment. You already checked your balance with get_payment_context. 

NOW you MUST call the "mcp__locus__send_to_address" tool immediately with these EXACT parameters:
{
  "address": "${receiverWalletAddress}",
  "amount": ${finalPrice.toFixed(2)},
  "memo": "${orderMemo}"
}

This is CRITICAL - call the tool NOW. Do not check balance again, do not explain, just execute the tool call immediately.`;

      const retryResult = await buyerAgentQueryWithTools(retryPrompt);
      console.log(`\n📋 Tools called on retry: ${retryResult.toolsCalled.map(t => t.name).join(', ')}`);
      
      if (!retryResult.toolsCalled.some(t => t.name.includes('send_to_address'))) {
        console.error('\n❌ ERROR: Payment tool was still not called after retry.');
        console.error('This may indicate:');
        console.error('  1. Insufficient funds (balance too low)');
        console.error('  2. MCP tool not available or not authorized');
        console.error('  3. Agent not following instructions');
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ CONVERSATION COMPLETE!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total turns: ${turnCount + 1}`);
    console.log(`   - Item ordered: ${foodItem || 'Food item'}`);
    console.log(`   - Amount: $${finalPrice.toFixed(2)}`);
    console.log(`   - Payment: ${paymentResponse.includes('success') || paymentResponse.includes('transaction') ? 'Completed' : 'In process'}`);
  } else {
    console.log('\n⚠️  No agreement reached or conversation ended.');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function main(): Promise<void> {
  try {
    // Validate environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    if (!process.env.LOCUS_API_KEY_SENDER) {
      console.warn('⚠️  Warning: LOCUS_API_KEY_SENDER not found. Payment tools may not work.');
    }
    
    if (!process.env.LOCUS_WALLET_ADDRESS_RECEIVER) {
      console.warn('⚠️  Warning: LOCUS_WALLET_ADDRESS_RECEIVER not found. Payment cannot be completed.');
    }
    
    await runAgentConversation();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Error:', errorMessage);
    console.error('\nPlease check:');
    console.error('  • Your .env file contains valid credentials');
    console.error('  • Your network connection is active');
    console.error('  • Your Locus and Anthropic API keys are correct\n');
    process.exit(1);
  }
}

main();
