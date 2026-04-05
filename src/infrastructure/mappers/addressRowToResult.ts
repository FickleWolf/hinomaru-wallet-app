import type { AddressesResult } from "@/application/ports/AddressesRepository";
import type { AddressRow } from "@/infrastructure/db/schema";

export const addressRowToResult = (dbModel: AddressRow): AddressesResult => {
  return {
    address: dbModel.address,
    name: dbModel.name,
    isMine: dbModel.is_mine === 1,
    updatedAt: new Date(dbModel.updated_at * 1000),
    createdAt: new Date(dbModel.created_at * 1000)
  };
};
