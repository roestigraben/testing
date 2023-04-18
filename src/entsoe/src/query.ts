import axios from 'axios'
import { QueryParameters } from "../parameters";
import { Area, Areas } from "./definitions/areas";
import { DocumentType, DocumentTypes } from "./definitions/documenttypes";
import { ProcessType, ProcessTypes } from "./definitions/processtypes";
import { BusinessType, BusinessTypes } from "./definitions/businesstypes";
import { PsrType, PsrTypes } from "./definitions/psrtypes";
import { 
    GLDocument,
    ParseDocument, 
    PublicationDocument, 
    UnavailabilityDocument, 
} from "./documents";

const ENTSOE_ENDPOINT = "https://web-api.tp.entsoe.eu/api";

const ComposeQuery = (securityToken: string, params: QueryParameters, force?: boolean | undefined): URLSearchParams => {
    const query = new URLSearchParams({
      securityToken,
    });
  
    // Validate documentType, add to parameter list
    if (!(params.documentType in DocumentTypes) && !force) {
      throw new Error("Invalid document type requested");
    } else {
      query.append("DocumentType", params.documentType);
    }
  
    // Validate processType if requested , add to parameter list
    if (params.processType !== undefined) {
      if (!(params.processType in ProcessTypes) && !force) {
        throw new Error("Invalid process type requested");
      } else {
        query.append("ProcessType", params.processType);
      }
    }
  
    // Validate businessType if requested , add to parameter list
    if (params.businessType !== undefined) {
      if (!(params.businessType in BusinessTypes) && !force) {
        throw new Error("Invalid business type requested");
      } else {
        query.append("BusinessType", params.businessType);
      }
    }
  
    // Validate processType if requested , add to parameter list
    if (params.psrType !== undefined) {
      if (!(params.psrType in PsrTypes) && !force) {
        throw new Error("Invalid psr type requested");
      } else {
        query.append("PsrType", params.psrType);
      }
    }
  
    // Validate inDomain, add to parameter list
    if (params.inDomain) {
      if (!(params.inDomain in Areas) && !force) {
        throw new Error("inDomain not valid");
      } else {
        query.append("In_Domain", params.inDomain);
      }
    }
  
    // Validate inBiddingZoneDomain, add to parameter list
    if (params.inBiddingZoneDomain) {
      if (!(params.inBiddingZoneDomain in Areas) && !force) {
        throw new Error("inBiddingZoneDomain not valid");
      } else {
        query.append("InBiddingZone_Domain", params.inBiddingZoneDomain);
      }
    }
  
    // Validate biddingZoneDomain, add to parameter list
    if (params.biddingZoneDomain) {
      if (!(params.biddingZoneDomain in Areas) && !force) {
        throw new Error("biddingZoneDomain not valid");
      } else {
        query.append("BiddingZone_Domain", params.biddingZoneDomain);
      }
    }
  
    // Validate offset, add to parameter list
    if (params.offset !== void 0) {
      if (params.offset > 5000) {
        throw new Error("Offset too large");
      }
      if (params.offset < 0) {
        throw new Error("Offset too small");
      }
      query.append("offset", params.offset.toString());
    }
  
    // Validate outDomain, add to parameter list
    if (params.outDomain) {
      if (!(params.outDomain in Areas) && !force) {
        throw new Error("outDomain not valid");
      } else {
        query.append("Out_Domain", params.outDomain);
      }
    }
  
    // Validate outBiddingZoneDomain, add to parameter list
    if (params.outBiddingZoneDomain) {
      if (!(params.outBiddingZoneDomain in Areas) && !force) {
        throw new Error("outBiddingZoneDomain not valid");
      } else {
        query.append("OutBiddingZone_Domain", params.outBiddingZoneDomain);
      }
    }
  
    // Validate contractMarketAgreementType, add to parameter list
    if (params.contractMarketAgreementType) {
      query.append("Contract_MarketAgreement.Type", params.contractMarketAgreementType);
    }
  
    // Validate auctionType, add to parameter list
    if (params.auctionType) {
      query.append("Auction.Type", params.auctionType);
    }
  
    // Validate classificationSequenceAICPosition, add to parameter list
    if (params.classificationSequenceAICPosition) {
      query.append("ClassificationSequence_AttributeInstanceComponent.Position", params.classificationSequenceAICPosition);
    }
  
    // Validate auctionCategory, add to parameter list
    if (params.auctionCategory) {
      query.append("Auction.Category", params.auctionCategory);
    }
  
    // Validate connectingDomain, add to parameter list
    if (params.connectingDomain) {
      query.append("connecting_Domain", params.connectingDomain);
    }
  
    // Validate standardMarketProduct, add to parameter list
    if (params.standardMarketProduct) {
      query.append("Standard_MarketProduct", params.standardMarketProduct);
    }
  
    // Validate connectingDomain, add to parameter list
    if (params.originalMarketProduct) {
      query.append("Original_MarketProduct", params.originalMarketProduct);
    }
  
    // Validate connectingDomain, add to parameter list
    if (params.registeredResource) {
      query.append("registeredResource", params.registeredResource);
    }
  
    // Validate connectingDomain, add to parameter list
    if (params.acquiringDomain) {
      query.append("Acquiring_Domain", params.acquiringDomain);
    }
  
    // Validate mRID, add to parameter list
    if (params.mRID) {
      query.append("mRID", params.mRID);
    }
  
    // Validate docStatus, add to parameter list
    if (params.docStatus) {
      query.append("DocStatus", params.docStatus);
    }
  
    // Validate startDateTimeUpdate, endDateTimeUpdate, custruct timeIntervalUpdate
    if (params.startDateTimeUpdate) {
      if (!(params.startDateTimeUpdate instanceof Date && !isNaN(params.startDateTimeUpdate.getTime()))) {
        throw new Error("startDateTimeUpdate not valid, should be Date object");
      }
      if (!(params.endDateTimeUpdate instanceof Date && !isNaN(params.endDateTimeUpdate.getTime()))) {
        throw new Error("endDateTimeUpdate not valid, should be Date object");
      }
      const timeInterval = `${params.startDateTimeUpdate.toISOString()}/${params.endDateTimeUpdate.toISOString()}`;
      query.append("TimeIntervalUpdate", timeInterval);
    }
  
    // Validate startDateTime, endDateTime, custruct timeInterval
    if (params.startDateTime) {
      if (!(params.startDateTime instanceof Date && !isNaN(params.startDateTime.getTime()))) {
        throw new Error("startDateTime not valid, should be Date object");
      }
      if (!(params.endDateTime instanceof Date && !isNaN(params.endDateTime.getTime()))) {
        throw new Error("endDateTime not valid, should be Date object");
      }
      const timeInterval = `${params.startDateTime.toISOString()}/${params.endDateTime.toISOString()}`;
      query.append("TimeInterval", timeInterval);
    }
  
    // Validate implementationDateAndOrTime, add to parameters
    if (params.implementationDateAndOrTime) {
      if (typeof params.implementationDateAndOrTime !== "string") {
        throw new Error("implementationDateAndOrTime not valid, should be string in ISO8601 format");
      }
      query.append("Implementation_DateAndOrTime", params.implementationDateAndOrTime);
    }
  
    if ((!params.startDateTime && !params.startDateTimeUpdate && !params.implementationDateAndOrTime) && !force) {
      throw new Error("startDateTime, startDateTimeUpdate or implementationDateAndOrTime must be specified");
    }
  
    return query;
  };



/**
 * Function to request generic documents from the ENTSO-e Rest API
 *
 * Identifies the fetched document, validates key features and returns an array of typed documents
 *
 * Will throw if recieving a document other than the ones currently supported,
 * which is
 *
 *   - Publication_MarketDocument
 *   - GL_MarketDocument
 *   - Unavailability_MarketDocument
 *
 * Note: You should normally determine which document type you'll get
 * and use the properly typed alternative. Example: If you expect a
 * Publication document - use `QueryPublication()` instead of `Query`
 *
 * @public
 *
 * @category Querying
 *
 * @param securityToken - Entsoe API security token/key
 * @param params - Object with all requested parameters
 *
 * @returns - Array of typed documents
 */
const Query = async (securityToken: string, params: QueryParameters): Promise<(PublicationDocument | GLDocument | UnavailabilityDocument)[]> => {
    const query = ComposeQuery(securityToken, params);
    // console.log('query from ComposeQuery   :', query)
    // Construct url and get result
    const result = await fetch(`${ENTSOE_ENDPOINT}?${query}`);

    // Check for 401
    if (result.status === 401) {
    throw new Error("401 Unauthorized. Missing or invalid security token.");
    }

    // Placeholder for documents
    const documents = [];

    // Check for xml response - parse document and return instantly
    // Some endpoints do not respond with a content-type, assume XML om these too
    // if (result) {
    if (result.headers.get("content-type")?.includes("xml") || !result.headers.has("content-type")) {
      // console.log('result : ', await result.text())
      // Parse result
      // documents.push(await ParseDocument(await result.data));
      documents.push(await ParseDocument(await result.text()));
    }
    // console.log('documents from Query function ', documents)
    return documents;
};


/**
 * Fetch and process GL_MarketDocument(s)
 *
 * Identifies the fetched document, validates key features, and returns an array of typed documents.
 *
 * If the query yield something other than GL_MarketDocument(s), an error will be thrown.
 *
 * @public
 * @category Querying
 *
 * @param securityToken - Entsoe API security token/key
 * @param params - Object with all requested parameters
 *
 * @returns - Array of typed documents
 * 
 */


const QueryGL = async (securityToken: string, params: QueryParameters): Promise<GLDocument[]> => {
    // console.log(securityToken, params)
    const result = await Query(securityToken, params);
    // console.log('result inside QueryGL function   --> ', result)
    if (result && Array.isArray(result) && result.length && result[0].rootType === "gl") return result as GLDocument[];
    if (result && Array.isArray(result) && result.length && result[0].rootType !== "gl") {
      throw new Error("Got " + result[0].rootType + " when expecting gl document");
    }
    return [];
};

/** Export all functions intended for public use */
export {
    QueryGL,
    DocumentType,
    Area,
    ProcessType,
    BusinessType,
    PsrType
  };