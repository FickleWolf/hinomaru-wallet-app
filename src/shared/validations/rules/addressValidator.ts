import * as v from "valibot";
import { getAddress, isAddress, zeroAddress } from "viem";

import type { Hex } from "viem";

export const addressValidator = (field: string) =>
  v.pipe(
    v.string(`${field} must be a string.`),
    v.transform(s => s.trim()),
    v.custom(
      s => isAddress(s as string, { strict: false }),
      () => `${field} must be a valid EVM address.`
    ),
    v.transform(s => getAddress(s)),
    v.custom(
      s => s !== zeroAddress,
      () => `${field} must not be the zero address.`
    )
  );

export const hex32Validator = (field: string) =>
  v.pipe(
    v.string(`${field} must be a string.`),
    v.trim(),
    v.length(32, `${field} must be 32 characters long.`),
    v.regex(/^[0-9a-fA-F]{32}$/, `${field} must be a 32-char hex string.`)
  );

export const hex64Validator = (field: string) =>
  v.pipe(
    v.string(`${field} must be a string.`),
    v.regex(/^0x[0-9a-fA-F]{64}$/, `${field} must be a 0x-prefixed, 64-hex-character string.`),
    v.transform((s): Hex => s.toLowerCase() as Hex)
  );
