# Local persistence and conflict spikes — Session 05

## Spike 09 — IndexedDB capacity and recovery

**Hypothesis:** one local project can keep image `File`/Blob objects and small settings without placing original pixels in LocalStorage.  
**Minimal test / run:** The isolated lab saved 12 distinct Windows wallpaper JPEGs (14,598,954 B total) with 12 assignments, crop offsets/zoom, background and text-color state, typography choice, timestamp and revision in one IndexedDB record. Both Windows Chrome 153 and Edge 153 reported `navigator.storage.estimate().usage = 14,696,448 B`; reload restored all 12 names/sizes/types and the state at revision 1. The fresh headless-profile quota estimate was ~6.46 GB, which is environment-specific and not a V1 guarantee.

**Result:** **PARTIAL** across the V1 matrix. The Product Owner reported one real iPhone Safari save/restore run that worked (**PASS** for that observed run), but did not supply source count/bytes, usage/quota, exact reload path or iOS version. The desktop proxy files are smaller than many phone originals. Site-data clearing, browser eviction, private browsing, app suspension, 12 measured real phone photos and long-term reopening remain untested. A source photo reused by two month assignments should ideally be stored once, but that deduplication policy was not implemented in the spike. This is not a schema decision.

**Other candidate:** LocalStorage is suitable at most for small serializable settings. It cannot directly store Blobs and was intentionally not used for the large image originals. IndexedDB Blob storage is an **ADR CANDIDATE**, not yet a final strategy. [Browser storage quota/eviction reference](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

## Quota and failed-write experiment

Chrome DevTools Protocol's [quota override](https://chromedevtools.github.io/devtools-protocol/tot/Storage/#method-overrideQuotaForOrigin) reported active at about 3.29 MB after a 3.19 MB valid save. A later 9.15 MB `File` selection still wrote successfully in both Chrome and Edge. Thus the override did **not** produce a trustworthy `QuotaExceededError` in this harness; the result is **inconclusive**, not a successful quota-recovery test. Do not infer that actual origin quotas are unlimited.

As a separate failure-path proxy, a non-cloneable function caused `DataCloneError` during `put`. Both browsers retained the last valid revision 2 and nine saved files. That proves this particular failed transaction did not replace the prior record; it does not prove real quota behavior. [Raw quota result](../spikes/browser-lab/results/quota-results.json).

**Recommendation:** Technical Design should protect the last complete saved state, report unsaved changes, and test a true quota failure before production. No quota threshold, compression or eviction policy is selected in this session.

## Spike 10 — Multi-tab conflict

**Hypothesis:** a stale tab can be detected before it overwrites a newer local project.  
**Minimal test / run:** Tab A restored revision 1; Tab B restored the same revision and saved revision 2; Tab A attempted a write. A `BroadcastChannel` message flagged the newer revision, and an IndexedDB read/write transaction independently compared revisions before `put`. Both Chrome and Edge rejected Tab A with `stale revision 1; saved 2`; the newer record survived.

**Result:** **PASS** for the named same-origin desktop race. **PARTIAL** for the V1 browser matrix: Safari/iOS tab suspension, delayed or absent BroadcastChannel notifications, crash timing, and storage eviction were not tested. The revision check is the safety mechanism; signaling only improves speed of feedback. The spike is not a production lock or state system.

## Device handoff

Use [qa/ios-technical-validation.md](../qa/ios-technical-validation.md) to test 12 real iPhone/iPad photos, reload recovery and A/B Safari tabs. Record available storage and exact files before deciding whether V1's local-only promise is feasible on supported devices.
