import type { AttributeDtoList } from './attributeDtoList';

export interface ServiceAssetsRequest {
  ServiceId: number;
  ServiceAlias?: string;
  InteractorId?: number;
  RoleType?: string;
  CompositeServiceStepId?: number;
  InterCompanyServiceId?: number;
  ItemId?: number;
  SelectorValue?: string;
  SelectorExtendedValue?: string;
  SelectorDetailedValue?: string;
  JsonSerializedRequestAttributeDtos?: string;
  ExtraParameters?: ExtraParameters;
  AssetIdList?: number[];
  ClientRequestAttributeDtos?: AttributeDtoList[];
}

export interface ExtraParameters {
  param1: string;
  param2: string;
}
