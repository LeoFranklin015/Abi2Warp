import { Warp, WarpAction, WarpActionInput } from "@/types/Warp";

export const convertAbiToWarp = (abi: any, contractAddress: string): Warp => {
  const contractName = abi.name;
  const actions: WarpAction[] = abi.endpoints.map((endpoint: any) => {
    const isOnlyOwner = endpoint.onlyOwner || false;
    const isReadonly = endpoint.mutability === "readonly";

    return {
      type: isReadonly ? "query" : "contract",
      label: `${isReadonly ? "Query" : "Call"} ${endpoint.name}`,
      address: contractAddress,
      func: endpoint.name,
      args: [],
      gasLimit: isReadonly ? 5000000 : 60000000,
      inputs: endpoint.inputs.map((input: any, index: number) => ({
        name: input.name,
        type:
          input.type === "bytes"
            ? "string"
            : input.type === "u64"
            ? "biguint"
            : input.type,
        position: `arg:${index + 1}`,
        source: "field",
        required: true,
      })),
    };
  });

  return {
    protocol: "warp:0.2.0",
    name: contractName,
    title: `Execute ${contractName} Actions`,
    description: `Auto-generated Warp actions for ${contractName}`,
    preview: "https://vleap.io/images/external/warps/multiversx-docs.jpg",
    actions: [...actions],
  };
};
