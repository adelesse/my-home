export interface LightState {
  on: boolean;
  bri: number;
  alert?: string;
  mode?: string;
  reachable?: boolean;
  hue?: number;
  sat?: number;
  effect?: string;
  xy?: number[];
  ct?: number;
  colormode?: string;
}

export interface SwUpdate {
  state: string;
  lastinstall: string;
}

export interface Capabilities {
  certified: boolean;
  control: {
    mindimlevel?: number;
    maxlumen?: number;
    colorgamuttype?: string;
    colorgamut?: number[][];
    ct?: {
      min: number;
      max: number;
    };
  };
  streaming: {
    renderer: boolean;
    proxy: boolean;
  };
}

export interface Config {
  archetype: string;
  function: string;
  direction: string;
  startup?: {
    mode: string;
    configured: boolean;
  };
}

export interface Light {
  id?: string;
  state: LightState;
  swupdate: SwUpdate;
  type: string;
  name: string;
  modelid: string;
  manufacturername: string;
  productname: string;
  capabilities: Capabilities;
  config: Config;
  uniqueid: string;
  swversion: string;
  swconfigid?: string;
  productid?: string;
}
