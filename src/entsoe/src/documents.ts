// import { XMLParser } from "../deps";
import { XMLParser } from "../deps";
import { ParsePublication, PublicationDocument } from "./documents/publication";
import { GLDocument,  ParseGL} from "./documents/gl";
import { UnavailabilityDocument } from "./documents/unavailability";
import { TransmissionNetworkDocument } from "./documents/transmittionnetwork";
import { BalancingDocument } from "./documents/balancing";
import { SourceDocument } from "./documents/common";


const ParseDocument = (
    xmlDocument: string,
  ): PublicationDocument | GLDocument | UnavailabilityDocument | TransmissionNetworkDocument | BalancingDocument => {
    // throw new Error("Unknown XML document structure received");
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@",
    }); 
    const doc =  parser.parse(xmlDocument) as SourceDocument;
  
    // Check document type
    if (doc.Publication_MarketDocument) {
      return ParsePublication(doc.Publication_MarketDocument);
    } else if (doc.GL_MarketDocument) {
    return ParseGL(doc.GL_MarketDocument);
    /*} else if (doc.Unavailability_MarketDocument) {
      return ParseUnavailability(doc.Unavailability_MarketDocument);
    } else if (doc.Configuration_MarketDocument) {
      return ParseConfiguration(doc.Configuration_MarketDocument);
    } else if (doc.TransmissionNetwork_MarketDocument) {
      return ParseTransmissionNetwork(doc.TransmissionNetwork_MarketDocument);
    } else if (doc.Balancing_MarketDocument) {
      return ParseBalancing(doc.Balancing_MarketDocument);
    } else if (doc.CriticalNetworkElement_MarketDocument) {
      return ParseCriticalNetworkElement(doc.CriticalNetworkElement_MarketDocument); */
    } else if (doc.Acknowledgement_MarketDocument) {
      const invalidRootNode = doc.Acknowledgement_MarketDocument;
      throw new Error(
        `Request failed. Code '${invalidRootNode.Reason.code}', Reason '${invalidRootNode.Reason.text}'`,
      );
    } else {
      throw new Error("Unknown XML document structure received");
    }
  };

export type {
    
    GLDocument,
    PublicationDocument,
    UnavailabilityDocument,
    TransmissionNetworkDocument,
    BalancingDocument
  };

  export { ParseDocument };