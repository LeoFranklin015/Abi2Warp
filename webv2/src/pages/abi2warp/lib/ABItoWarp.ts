import { Warp, WarpAction } from '../types/Warp';

import OpenAI from 'openai';

interface ABIEndpoint {
  name: string;
  mutability?: string;
  onlyOwner?: boolean;
  inputs: Array<{
    name: string;
    type: string;
    [key: string]: unknown;
  }>;
}

interface ABIDefinition {
  name: string;
  endpoints: ABIEndpoint[];
}

interface WarpMetadata {
  name: string;
  title: string;
  description: string;
  preview: string;
}

// Function to identify selected functions from the ABI
export const getSelectedFunctions = (
  abi: ABIDefinition,
  selectedFunctionNames?: string[]
): ABIEndpoint[] => {
  if (!selectedFunctionNames || selectedFunctionNames.length === 0) {
    return abi.endpoints;
  }

  return abi.endpoints.filter((endpoint) =>
    selectedFunctionNames.includes(endpoint.name)
  );
};

// Function to generate metadata using OpenAI
export const generateWarpMetadataWithOpenAI = async (
  contractName: string,
  selectedFunctions: ABIEndpoint[],
  abi: ABIDefinition,
  apiKey: string
): Promise<WarpMetadata> => {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    const functionNames = selectedFunctions.map((func) => func.name).join(', ');
    const prompt = `Generate a concise name, title, and description for a smart contract interface.
Contract name: ${contractName}
Available functions: ${functionNames}
The complete ABI is: ${JSON.stringify(abi)}

For ex : A ABI might contain all the functions of a DAO, but you only want to generate description for given functions. If its all , the genrerate description for all the functions.
- If the function is ["vote"] , then describe what the function does.
- If the function is ["all"] , then describe what the contract does in general.

Please respond in JSON format with the following structure:
{
  "name": "A short name for the contract interface (max 20 chars)",
  "title": "A title describing what this interface does (max 50 chars)",
  "description": "A more detailed description of the contract functionality (max 150 chars)"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a smart contract documentation assistant that creates clear, concise descriptions. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const content = response.choices[0]?.message.content || '{}';
    let metadata: WarpMetadata;
    try {
      // First, try to parse the content directly as JSON
      metadata = JSON.parse(content.trim()) as WarpMetadata;
    } catch (parseError) {
      console.log(
        'Direct JSON parsing failed, trying to extract JSON from response'
      );

      try {
        // Check if the response is a code block with JSON
        const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          metadata = JSON.parse(jsonBlockMatch[1].trim()) as WarpMetadata;
        } else {
          // Try to extract any JSON object from the response
          const jsonMatch = content.match(/(\{[\s\S]*\})/);
          if (jsonMatch && jsonMatch[1]) {
            metadata = JSON.parse(jsonMatch[1].trim()) as WarpMetadata;
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      } catch (extractError) {
        console.error('Error extracting JSON from response:', extractError);
        console.log('Raw response:', content);

        // Fall back to default values
        metadata = {
          name: contractName,
          title: `Execute ${contractName} Actions`,
          description: `Auto-generated Warp actions for ${contractName}`,
          preview: 'https://vleap.io/images/external/warps/multiversx-docs.jpg'
        };
      }
    }
    const imageResult = await openai.images.generate({
      model: 'dall-e-3',
      prompt: metadata.title,
      n: 1,
      size: '1024x1024'
    });
    const imageUrl = imageResult.data[0].url;
    return {
      name: metadata.name || contractName,
      title: metadata.title || `Execute ${contractName} Actions`,
      description:
        metadata.description ||
        `Auto-generated Warp actions for ${contractName}`,
      preview:
        imageUrl || 'https://vleap.io/images/external/warps/multiversx-docs.jpg'
    };
  } catch (error) {
    console.error('Error generating metadata with OpenAI:', error);
    return {
      name: contractName,
      title: `Execute ${contractName} Actions`,
      description: `Auto-generated Warp actions for ${contractName}`,
      preview: 'https://vleap.io/images/external/warps/multiversx-docs.jpg'
    };
  }
};

export const convertAbiToWarp = async (
  abi: ABIDefinition,
  contractAddress: string,
  completeABI: ABIDefinition,
  options?: {
    selectedFunctions?: string[];
    openAIApiKey?: string;
  }
): Promise<Warp> => {
  const contractName = abi.name;
  if (!options?.openAIApiKey) {
    throw new Error('OpenAI API key is required');
  }
  const selectedFunctions = getSelectedFunctions(
    abi,
    options?.selectedFunctions
  );

  const actions: WarpAction[] = abi.endpoints.map((endpoint: ABIEndpoint) => {
    const isReadonly = endpoint.mutability === 'readonly';

    return {
      type: isReadonly ? 'query' : 'contract',
      label: `${isReadonly ? 'Query' : 'Call'} ${endpoint.name}`,
      address: contractAddress,
      func: endpoint.name,
      args: [],
      gasLimit: isReadonly ? 5000000 : 60000000,
      inputs: endpoint.inputs.map((input, index: number) => ({
        name: input.name,
        type:
          input.type === 'bytes'
            ? 'string'
            : input.type === 'u64'
            ? 'biguint'
            : input.type,
        position: `arg:${index + 1}`,
        source: 'field',
        required: true
      }))
    };
  });

  // Generate metadata with OpenAI if API key is provided
  let metadata: WarpMetadata;
  if (options?.openAIApiKey) {
    metadata = await generateWarpMetadataWithOpenAI(
      contractName,
      selectedFunctions,
      completeABI,
      options.openAIApiKey
    );
  } else {
    metadata = {
      name: contractName,
      title: `Execute ${contractName} Actions`,
      description: `Auto-generated Warp actions for ${contractName}`,
      preview: 'https://vleap.io/images/external/warps/multiversx-docs.jpg'
    };
  }

  return {
    protocol: 'warp:0.2.0',
    name: metadata.name,
    title: metadata.title,
    description: metadata.description,
    preview: metadata.preview,
    actions: [...actions]
  };
};
