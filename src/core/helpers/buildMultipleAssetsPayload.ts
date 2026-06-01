import type { MultipleAssetsInput, ParametersValues, ServiceItemOutput } from 'octopian-apis';

/**
 * Extended payload type used by our UI/payment flow.
 * The backend accepts extra fields, but the SDK type `MultipleAssetsInput` doesn't include them.
 */
export type PaymentMultipleAsset = MultipleAssetsInput & Readonly<{ ItemId?: number }>;

/**
 * Minimal shape we need from a selected donation row to build `MultipleAssets`.
 * Kept generic so it can be reused across modules (Mosques, etc).
 */
export type DonationForMultipleAssets = Readonly<{
  /** Selected Asset id (string in UI state, will be parsed to number) */
  id: string;
  /** Selected amount for this asset */
  amount: number;
  /** Used as a friendly Description parameter (optional to include) */
  title: string;
  /** Whether to repeat the donation */
  repeat?: boolean;
  /** The interval of the donation */
  interval?: number;
  /** The period of the donation */
  period?: 'M' | 'W';
  /** The term of the donation */
  term?: number;
  /** The next date of the donation (DDMMYYYY) */
  startDate?: string;
}>;

export type SelectedItemsByAssetId = Readonly<Record<string, ReadonlyArray<string>>>;

export type BuildMultipleAssetsPayloadOptions = Readonly<{
  /** Selected donations list (one row per selected asset) */
  selectedDonations: ReadonlyArray<DonationForMultipleAssets>;
  /** Additional selections keyed by asset id */
  selectedItemsByAssetId: SelectedItemsByAssetId;
  /**
   * Optional `getServiceItemList` results keyed by AssetId.
   * Needed when building ParametersValues from ServiceItemOutput.Alias + Itemlist.Cost.
   */
  serviceItemsByAssetId?: Readonly<Record<string, ReadonlyArray<ServiceItemOutput>>>;
  /**
   * If true, `ParametersValues` will be an empty array unless the asset has at least one
   * selected additional item.
   *
   * This matches the desired behavior:
   * - no add-ons selected => ParametersValues: []
   * - add-ons selected => include Amount/Description (and optionally others)
   */
  onlyIncludeParamsWhenHasAdditionalSelections?: boolean;
  /** Alias name for the amount parameter (defaults to "Amount") */
  amountAlias?: string;
  /** Alias name for the description parameter (defaults to "Description") */
  descriptionAlias?: string;
  /** Alias name for the repeat parameter (defaults to "Repeat") */
  repeatAlias?: string;
  /** Alias name for the interval parameter (defaults to "Interval") */
  intervalAlias?: string;
  /** Alias name for the period parameter (defaults to "Period") */
  periodAlias?: string;
  /** Alias name for the term parameter (defaults to "Term") */
  termAlias?: string;
  /** Alias name for the start date parameter (defaults to "StartDate") */
  startDateAlias?: string;
  /**
   * Alias name for each additional selected item entry (defaults to "AdditionalServiceId")
   * If backend expects a different alias, override here.
   */
  additionalItemAlias?: string;
  /** Whether to include Description parameter (defaults to true) */
  includeDescription?: boolean;
  /**
   * Whether to include selected additional item ids as individual ParametersValues entries.
   * Defaults to true to preserve the original behavior.
   *
   * For Mosques you asked to NOT include these ids, so we'll pass false.
   */
  includeAdditionalSelections?: boolean;

  /**
   * Controls how ParametersValues are constructed when an asset has add-ons selected.
   * - "donationAmountAndTitle": uses donation amount + title (and optional selection ids)
   * - "serviceItemAliasAndCost": uses ServiceItemOutput.Alias and selected Itemlist.Cost
   */
  parametersValuesStrategy?: 'donationAmountAndTitle' | 'serviceItemAliasAndCost';

  /**
   * If true (and `parametersValuesStrategy` is "serviceItemAliasAndCost"),
   * create one `MultipleAssets` entry per selected add-on item (same AssetId repeated),
   * instead of merging all add-ons into a single AssetId entry.
   *
   * This matches your requirement:
   * - select 2 add-ons => create 2 extra entries with the same AssetId
   */
  splitAdditionalSelectionsIntoSeparateAssets?: boolean;

  /**
   * If true (default), always include a "base" entry per selected asset with empty ParametersValues.
   * This matches your requirement where selecting an asset without add-ons yields ParametersValues: [].
   */
  includeBaseAssetEntry?: boolean;

  /**
   * When `includeBaseAssetEntry` is true, the base entry `ParametersValues` cannot be empty
   * (per your backend requirement).
   *
   * If not provided, the helper will use:
   * - Amount: computed base amount (see logic below), falling back to donation.amount
   * - Description: donation.title
   */
  baseEntryDefaults?: Readonly<{
    /** Override for Amount (string). If not provided, computed from donation/add-ons. */
    amountValue: string;
    /** Override for Description. If not provided, uses donation.title. */
    descriptionValue: string;
  }>;
}>;

function findServiceAliasAndCost(
  serviceItems: ReadonlyArray<ServiceItemOutput>,
  selectedItemId: string
): Readonly<{ serviceAlias: string; cost: string } | null> {
  // Walk each service group to find the selected item.
  for (let i = 0; i < serviceItems.length; i += 1) {
    const svc = serviceItems[i];
    const list = Array.isArray(svc.Itemlist) ? svc.Itemlist : [];

    for (let j = 0; j < list.length; j += 1) {
      const item = list[j];
      if (`${item.ItemId}` === selectedItemId) {
        const alias = typeof svc.Alias === 'string' ? svc.Alias : '';
        const cost = typeof item.Cost === 'string' ? item.Cost : '';
        if (alias.length === 0 || cost.length === 0) return null;
        return { serviceAlias: alias, cost };
      }
    }
  }

  return null;
}

/**
 * Build `MultipleAssets` payload for `GetPaymentURLMultipleAssetsInput`.
 *
 * Output:
 * - One entry per selected donation (AssetId)
 * - ParametersValues includes:
 *   - Amount
 *   - Description (optional)
 *   - One entry per additional selected item (optional)
 */
export function buildMultipleAssetsPayload(options: BuildMultipleAssetsPayloadOptions): PaymentMultipleAsset[] {
  // Resolve aliases with safe defaults.
  const amountAlias = options.amountAlias ?? 'Amount';
  const descriptionAlias = options.descriptionAlias ?? 'Description';
  const repeatAlias = options.repeatAlias ?? 'Repeat';
  const intervalAlias = options.intervalAlias ?? 'Interval';
  const periodAlias = options.periodAlias ?? 'Period';
  const termAlias = options.termAlias ?? 'Term';
  const startDateAlias = options.startDateAlias ?? 'StartDate';
  const additionalItemAlias = options.additionalItemAlias ?? 'AdditionalServiceId';
  const includeDescription = options.includeDescription ?? true;
  const includeAdditionalSelections = options.includeAdditionalSelections ?? true;
  const onlyIncludeParamsWhenHasAdditionalSelections = options.onlyIncludeParamsWhenHasAdditionalSelections ?? false;
  const parametersValuesStrategy = options.parametersValuesStrategy ?? 'donationAmountAndTitle';
  const splitAdditionalSelectionsIntoSeparateAssets = options.splitAdditionalSelectionsIntoSeparateAssets ?? false;
  const includeBaseAssetEntry = options.includeBaseAssetEntry ?? true;

  const results: PaymentMultipleAsset[] = [];

  options.selectedDonations.forEach((donation) => {
    // Track the base entry index (if created) so we can extend it without creating duplicates.
    let baseEntryIndex: number | null = null;

    // Parse & validate AssetId.
    const assetId = Number.parseInt(donation.id, 10);
    if (!Number.isFinite(assetId)) return;

    // Validate amount (avoid NaN/Infinity).
    if (!Number.isFinite(donation.amount) || donation.amount < 0) return;

    // Pull additional selections for this AssetId.
    const additionalSelections = options.selectedItemsByAssetId[donation.id] ?? [];

    // Always include a base entry if requested (must NOT be empty).
    if (includeBaseAssetEntry) {
      // Compute base amount:
      // - if no add-ons selected => donation.amount (asset cost)
      // - if add-ons selected and we have service items => donation.amount - sum(selected add-on costs)
      // - otherwise fallback => donation.amount
      let computedBaseAmount = donation.amount;
      if (additionalSelections.length > 0 && parametersValuesStrategy === 'serviceItemAliasAndCost') {
        const serviceItemsForAsset = options.serviceItemsByAssetId?.[donation.id] ?? [];
        if (serviceItemsForAsset.length > 0) {
          let addOnsTotal = 0;
          additionalSelections.forEach((selectedId) => {
            const match = findServiceAliasAndCost(serviceItemsForAsset, selectedId);
            if (!match) return;
            const costNumber = Number(match.cost);
            if (Number.isFinite(costNumber)) addOnsTotal += costNumber;
          });
          computedBaseAmount = Math.max(0, donation.amount - addOnsTotal);
        }
      }

      const baseAmountValue = options.baseEntryDefaults?.amountValue ?? `${computedBaseAmount}`;
      const baseDescriptionValue = options.baseEntryDefaults?.descriptionValue ?? donation.title;
      const repeatValue = donation.repeat ? 'true' : 'false';
      const intervalValue = donation.interval ? donation.interval.toString() : '';
      const periodValue = donation.period ? donation.period : '';
      const termValue = donation.term ? donation.term.toString() : '';
      const startDateValue = donation.startDate ? donation.startDate : '';
      results.push({
        AssetId: assetId,
        ParametersValues: [
          {
            Alias: amountAlias,
            Value: baseAmountValue,
            ExtendedValue: baseAmountValue,
          },
          {
            Alias: descriptionAlias,
            Value: baseDescriptionValue,
            ExtendedValue: baseDescriptionValue,
          },
          {
            Alias: repeatAlias,
            Value: repeatValue,
            ExtendedValue: repeatValue,
          },
          {
            Alias: intervalAlias,
            Value: intervalValue,
            ExtendedValue: intervalValue,
          },
          {
            Alias: periodAlias,
            Value: periodValue,
            ExtendedValue: periodValue,
          },
          {
            Alias: termAlias,
            Value: termValue,
            ExtendedValue: termValue,
          },
          {
            Alias: startDateAlias,
            Value: startDateValue,
            ExtendedValue: startDateValue,
          },
        ],
      });

      baseEntryIndex = results.length - 1;
    }

    // If requested, keep ParametersValues empty unless add-ons are selected for this asset.
    const shouldIncludeParams = !onlyIncludeParamsWhenHasAdditionalSelections || additionalSelections.length > 0;
    if (!shouldIncludeParams) return;

    // Strategy: build parameters from ServiceItemOutput.Alias + Itemlist.Cost.
    if (parametersValuesStrategy === 'serviceItemAliasAndCost') {
      const serviceItemsForAsset = options.serviceItemsByAssetId?.[donation.id] ?? [];

      // If the caller didn't pass service items, we can't build Cost-based params safely.
      if (serviceItemsForAsset.length === 0) return;

      // Either split into one entry per selection (same AssetId repeated) or merge (not requested here).
      if (splitAdditionalSelectionsIntoSeparateAssets) {
        additionalSelections.forEach((selectedId) => {
          const match = findServiceAliasAndCost(serviceItemsForAsset, selectedId);
          if (!match) return;
          const itemIdNumber = Number.parseInt(selectedId, 10);
          if (!Number.isFinite(itemIdNumber)) return;

          const parametersValues: ParametersValues[] = [
            {
              // Alias must be "Amount" (configurable via `amountAlias`), while value comes from the selected Itemlist.Cost.
              Alias: amountAlias,
              // Value/ExtendedValue come from the selected Itemlist.Cost (e.g., "100")
              Value: match.cost,
              ExtendedValue: match.cost,
            },
          ];

          // Optional: include asset title as an extra parameter for context.
          if (includeDescription) {
            parametersValues.push({
              Alias: descriptionAlias,
              Value: donation.title,
              ExtendedValue: donation.title,
            });
          }

          results.push({
            AssetId: assetId,
            ParametersValues: parametersValues,
            // Include the selected ItemId for this add-on (requested).
            ItemId: itemIdNumber,
          });
        });
      } else {
        // Merge mode (kept for completeness): one entry containing all selected add-ons for this asset.
        const merged: ParametersValues[] = [];
        additionalSelections.forEach((selectedId) => {
          const match = findServiceAliasAndCost(serviceItemsForAsset, selectedId);
          if (!match) return;
          merged.push({
            Alias: amountAlias,
            Value: match.cost,
            ExtendedValue: match.cost,
          });
        });

        if (includeDescription) {
          merged.push({
            Alias: descriptionAlias,
            Value: donation.title,
            ExtendedValue: donation.title,
          });
        }

        if (merged.length > 0) {
          results.push({
            AssetId: assetId,
            ParametersValues: merged,
          });
        }
      }

      return;
    }

    // Default strategy: Amount + Description + optional selection ids.
    // If a base entry already exists, do NOT create another entry for this asset.
    // Optionally, extend base entry with selection ids if requested.
    if (includeBaseAssetEntry && baseEntryIndex !== null) {
      if (includeAdditionalSelections) {
        const baseEntry = results[baseEntryIndex];
        additionalSelections.forEach((selectedId) => {
          baseEntry.ParametersValues.push({
            Alias: additionalItemAlias,
            Value: selectedId,
            ExtendedValue: selectedId,
          });
        });
      }
      return;
    }

    const parametersValues: ParametersValues[] = [];
    parametersValues.push({
      Alias: amountAlias,
      Value: `${donation.amount}`,
      ExtendedValue: `${donation.amount}`,
    });

    if (includeDescription) {
      parametersValues.push({
        Alias: descriptionAlias,
        Value: donation.title,
        ExtendedValue: donation.title,
      });
    }

    if (includeAdditionalSelections) {
      additionalSelections.forEach((selectedId) => {
        parametersValues.push({
          Alias: additionalItemAlias,
          Value: selectedId,
          ExtendedValue: selectedId,
        });
      });
    }

    // If we already included a base entry, we only add a params entry if the caller is using this strategy.
    results.push({
      AssetId: assetId,
      ParametersValues: parametersValues,
    });
  });

  return results;
}
