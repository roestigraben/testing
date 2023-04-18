import {
    BaseDocument,
    BaseEntry,
    SourceBaseDocument,
    SourceTimeInterval,
    SourceCodingSchemeTextEntry,
    SourcePeriod
    
  } from "./common";

interface TransmissionNetworkDocument extends BaseDocument {
    timeseries: TransmissionNetworkDocumentEntry[];
}

/**
 * Parsed TransmissionNetwork document timeseries entry
 *
 * @public
 * @category Document Interfaces
 */
interface TransmissionNetworkDocumentEntry extends BaseEntry {
quantityMeasureUnit?: string;
inDomain?: string;
outDomain?: string;
curveType?: string;
endDate?: Date;
assetRegisteredResourceId?: string;
assetRegisteredResourcePsrType?: string;
assetRegisteredResourcePsrTypeDescription?: string;
assetRegisteredResourceLocationName?: string;
}

interface SourceTransmissionNetworkEntry {
    businessType?: string;
    "in_Domain.mRID"?: SourceCodingSchemeTextEntry;
    "out_Domain.mRID"?: SourceCodingSchemeTextEntry;
    "quantity_Measure_Unit.name"?: string;
    curveType?: string;
    Period: SourcePeriod | SourcePeriod[];
    "end_DateAndOrTime.date"?: string;
    "end_DateAndOrTime.time"?: string;
    "Asset_RegisteredResource"?: SourceAssetRegisteredResource;
  }

interface SourceTransmissionNetworkDocument extends SourceBaseDocument {
    "period.timeInterval"?: SourceTimeInterval;
    TimeSeries: SourceTransmissionNetworkEntry[] | SourceTransmissionNetworkEntry;
}

interface SourceAssetRegisteredResource {
    mRID?: SourceCodingSchemeTextEntry;
    "pSRType.psrType"?: string;
    "location.name"?: string;
}

export type { 
    TransmissionNetworkDocument,
    SourceTransmissionNetworkDocument,
    SourceTransmissionNetworkEntry
    
};