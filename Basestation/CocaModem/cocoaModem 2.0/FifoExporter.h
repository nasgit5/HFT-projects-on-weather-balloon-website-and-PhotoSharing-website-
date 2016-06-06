//
//  3rdPartyAppsConnector.h
//  cocoaModem 2.0
//
//  Created by Michael Kolb on 02.12.13.
//
//

#import <Foundation/Foundation.h>



extern NSString *const FIFO_BUFFER_FILE;

@interface FifoExporter : NSObject



+(FifoExporter *)instance;
-(void)addReceivedBuffer:(NSString*) buffer;


-(void)createFifo;
-(void)resetFifo;


@end
