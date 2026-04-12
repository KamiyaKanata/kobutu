/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as channelContents from "../channelContents.js";
import type * as customerReplies from "../customerReplies.js";
import type * as itemPhotos from "../itemPhotos.js";
import type * as items from "../items.js";
import type * as kobutsuLedger from "../kobutsuLedger.js";
import type * as preEstimates from "../preEstimates.js";
import type * as seed from "../seed.js";
import type * as storeSettings from "../storeSettings.js";
import type * as stores from "../stores.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  channelContents: typeof channelContents;
  customerReplies: typeof customerReplies;
  itemPhotos: typeof itemPhotos;
  items: typeof items;
  kobutsuLedger: typeof kobutsuLedger;
  preEstimates: typeof preEstimates;
  seed: typeof seed;
  storeSettings: typeof storeSettings;
  stores: typeof stores;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
