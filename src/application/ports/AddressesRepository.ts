import type { Address } from "viem";

export interface AddressesRepository {
  get(address: Address): Promise<AddressesResult | null>;
  list(): Promise<AddressesResult[]>;
  listMine(): Promise<AddressesResult[]>;
  create(query: CreateAddressQuery): Promise<void>;
  update(query: UpdateAddressQuery): Promise<void>;
  delete(address: Address): Promise<void>;
}

export type AddressesResult = {
  address: Address;
  name: string;
  isMine: boolean;
  updatedAt: Date;
  createdAt: Date;
};

export type CreateAddressQuery = Pick<AddressesResult, "address" | "name" | "isMine">;

export type UpdateAddressQuery = Pick<AddressesResult, "address" | "name" | "isMine">;
