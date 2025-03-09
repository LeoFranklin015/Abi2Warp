export interface Warp {
  protocol: string;
  name: string;
  title: string;
  description: string;
  preview: string;
  actions: WarpAction[];
}

export interface WarpAction {
  type: string;
  label: string;
  address: string;
  func: string;
  args: string[];
  gasLimit: number;
  inputs?: WarpActionInput[];
}

export interface WarpActionInput {
  name: string;
  type: string;
  position: string;
  source: string;
  required: boolean;
}
