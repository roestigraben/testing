import { SourceBaseDocument, SourceReasonDetails } from "./common";

/** Source Acknowledgement_MarketDocument, extending SourceBaseDocument
 *
 * @private
 * @category Source Document Interfaces
 */
interface SourceAcknowledmentDocument extends SourceBaseDocument {
  Reason: SourceReasonDetails;
}

export type { SourceAcknowledmentDocument };
