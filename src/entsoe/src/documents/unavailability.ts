import {
    BaseDocument,
    BaseEntry,
    SourceBaseDocument,
    SourceTimeInterval,
    SourceUnitTextEntry,
    SourcePeriod,
    SourceReasonDetails,
  } from "./common";

interface UnavailabilityDocument extends BaseDocument {
    timeseries: UnavailabilityEntry[];
  }
  
  /**
   * Parsed Unavailability document timeseries entry
   *
   * @public
   * @category Document Interfaces
   */
  interface UnavailabilityEntry extends BaseEntry {
    startDate: Date;
    endDate: Date;
    resourceName?: string;
    resourceLocation?: string;
    psrName?: string;
    psrType?: string;
    psrNominalPower?: string;
    psrNominalPowerUnit?: string;
    reasonCode?: string;
    reasonText?: string;
  }

  interface SourceUnavailabilityEntry extends SourceBaseDocument {
    businessType?: string;
    "start_DateAndOrTime.date"?: string;
    "start_DateAndOrTime.time"?: string;
    "end_DateAndOrTime.date"?: string;
    "end_DateAndOrTime.time"?: string;
    "production_RegisteredResource.name"?: string;
    "production_RegisteredResource.location.name"?: string;
    "production_RegisteredResource.pSRType.powerSystemResources.name"?: string;
    "production_RegisteredResource.pSRType.powerSystemResources.nominalP"?: SourceUnitTextEntry;
    "production_RegisteredResource.pSRType.psrType"?: string;
    Reason?: SourceReasonDetails;
    Available_Period?: SourcePeriod | SourcePeriod[];
  }

  interface SourceUnavailabilityDocument extends SourceBaseDocument {
    "unavailability_Time_Period.timeInterval"?: SourceTimeInterval;
    TimeSeries: SourceUnavailabilityEntry[] | SourceUnavailabilityEntry;
  }

  export type {  UnavailabilityDocument, UnavailabilityEntry, SourceUnavailabilityDocument, SourceUnavailabilityEntry };