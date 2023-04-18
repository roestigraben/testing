import {
    BaseDocument,
    BaseEntry,
    SourceBaseDocument,
    SourceTimeInterval,
    SourceCodingSchemeTextEntry,
    SourcePeriod
  } from "./common";

interface BalancingDocument extends BaseDocument {
    areaDomainId?: string;
    timeseries: BalancingDocumentEntry[];
  }

interface BalancingDocumentEntry extends BaseEntry {
    quantityMeasureUnit?: string;
    flowDirection?: string;
    curveType?: string;
}

interface SourceBalancingEntry {
    businessType?: string;
    "flowDirection.direction"?: string;
    "quantity_Measure_Unit.name"?: string;
    curveType?: string;
    Period: SourcePeriod | SourcePeriod[];
  }

interface SourceBalancingDocument extends SourceBaseDocument {
    "period.timeInterval"?: SourceTimeInterval;
    "area_Domain.mRID"?: SourceCodingSchemeTextEntry;
    TimeSeries: SourceBalancingEntry[] | SourceBalancingEntry;
}

export type { 
    BalancingDocument, 
    SourceBalancingDocument,
    SourceBalancingEntry
};