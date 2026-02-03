import { z } from "zod";
import {
  IracingUserInfoSchema,
  TokenRespnseSchema,
  TokenResponseErrorSchema,
} from "./schema";

export type TokenResponse = z.infer<typeof TokenRespnseSchema>;
export type TokenResponseError = z.infer<typeof TokenResponseErrorSchema>;

export type IracingUserInfo = z.infer<typeof IracingUserInfoSchema>;
