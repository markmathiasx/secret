import { PrismaClient } from '@prisma/client';
import * as runtime from '@prisma/client/runtime/client.js';

type DenyList = runtime.ITXClientDenyList;
type TxClient = Omit<PrismaClient, DenyList>;
const tx: TxClient = {} as TxClient;
// @ts-expect-error -- If address exists, this will fail (we want it to)
const x: never = tx.address;
