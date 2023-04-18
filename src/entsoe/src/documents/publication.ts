import { BusinessTypes } from "../definitions/businesstypes";
import {
    BaseDocument,
    BaseEntry,
    SourceBaseDocument,
    SourcePeriod,
    SourceTimeInterval,
    SourceCodingSchemeTextEntry,
    TimeInterval,
    ParseBaseDocument,
    ParsePeriod,
 
  } from "./common";

interface PublicationDocument extends BaseDocument {
    timeseries: PublicationDocumentEntry[];
}

interface PublicationDocumentEntry extends BaseEntry {
currency?: string;
priceMeasureUnit?: string;
quantityMeasureUnit?: string;
inDomain?: string;
outDomain?: string;
auctionId?: string;
auctionType?: string;
auctionCategory?: string;
contractMarketAgreementType?: string;
curveType?: string;
classificationSequenceAICPosition?: number;
}

interface SourcePublicationDocument extends SourceBaseDocument {
  "period.timeInterval"?: SourceTimeInterval;
  TimeSeries: SourcePublicationEntry[] | SourcePublicationEntry;
}

/**
 * Source Publication_MarketDocument document TimeZone entries
 *
 * @private
 * @category Source Document Interfaces
 */
interface SourcePublicationEntry {
  Period: SourcePeriod | SourcePeriod[];
  businessType?: string;
  curveType?: string;
  "in_Domain.mRID"?: SourceCodingSchemeTextEntry;
  "out_Domain.mRID"?: SourceCodingSchemeTextEntry;
  "price_Measure_Unit.name"?: string;
  "quantity_Measure_Unit.name"?: string;
  "contract_MarketAgreement.type"?: string;
  "currency_Unit.name"?: string;
  "auction.mRID"?: string;
  "auction.type"?: string;
  "auction.category"?: string;
  "classificationSequence_AttributeInstanceComponent.position"?: number;
}

const ParsePublication = (d: SourcePublicationDocument): PublicationDocument => {
  // Check that TimeSeries is ok
  if (!d.TimeSeries) {
    throw new Error("Publication document invalid, missing TimeSeries");
  }

  const tsArray = Array.isArray(d.TimeSeries) ? d.TimeSeries : [d.TimeSeries];

  // Parse Publication-specific version of timeInterval
  let timeInterval: TimeInterval | undefined = void 0;
  if (d["period.timeInterval"]?.start && d["period.timeInterval"].end) {
    timeInterval = {
      start: new Date(Date.parse(d["period.timeInterval"]?.start)),
      end: new Date(Date.parse(d["period.timeInterval"]?.end)),
    };
  }

  const document: PublicationDocument = Object.assign(ParseBaseDocument(d), {
    rootType: "publication",
    timeInterval,
    timeseries: [],
  });

  for (const ts of tsArray) {
    const tsEntry: PublicationDocumentEntry = {
      currency: ts["currency_Unit.name"],
      priceMeasureUnit: ts["price_Measure_Unit.name"],
      quantityMeasureUnit: ts["quantity_Measure_Unit.name"],
      curveType: ts.curveType,
      businessType: ts.businessType,
      inDomain: ts["in_Domain.mRID"]?.["#text"],
      outDomain: ts["out_Domain.mRID"]?.["#text"],
      auctionId: ts["auction.mRID"],
      auctionType: ts["auction.type"],
      auctionCategory: ts["auction.category"],
      contractMarketAgreementType: ts["contract_MarketAgreement.type"],
      classificationSequenceAICPosition: ts["classificationSequence_AttributeInstanceComponent.position"],
      businessTypeDescription: ts.businessType ? (BusinessTypes as Record<string, string>)[ts.businessType] : void 0,
      periods: [],
    };
    const periodArray = Array.isArray(ts.Period) ? ts.Period : (ts.Period ? [ts.Period] : []);
    for (const inputPeriod of (periodArray as SourcePeriod[])) {
      tsEntry.periods?.push(ParsePeriod(inputPeriod));
    }
    document.timeseries.push(tsEntry);
  }

  return document;
};

export type { PublicationDocument, PublicationDocumentEntry, SourcePublicationDocument };

export { ParsePublication };