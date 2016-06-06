//
//  3rdPartyAppsConnector.m
//  cocoaModem 2.0
//
//  Created by Michael Kolb on 02.12.13.
//
//

#import "FifoExporter.h"

@implementation FifoExporter

NSString *const FIFO_BUFFER_FILE=@"/tmp/cocaModem.fifo";

+(FifoExporter*)instance{
    static FifoExporter *sharedFifoExporter=NULL;
    @synchronized(self){
        
        if(sharedFifoExporter == NULL){
            sharedFifoExporter=[[self alloc] init];
            [sharedFifoExporter resetFifo];
            [sharedFifoExporter createFifo];
        }
    }
    return sharedFifoExporter;
}



-(void) addReceivedBuffer:(NSString*) buffer{
    //NSError *error = nil;
    
    NSFileHandle *fileHandle=[NSFileHandle fileHandleForWritingAtPath:@"/tmp/cocaModem.fifo"];
    [fileHandle seekToEndOfFile];
    [fileHandle writeData:[buffer dataUsingEncoding:NSUTF8StringEncoding]];
    [fileHandle closeFile];
    /*[buffer writeToFile:@"/tmp/cocaModem.fifo" atomically:YES encoding:NSUTF8StringEncoding error:&error];
    if(error){
        NSLog(@"Fail: %@",[error localizedDescription]);
    }*/
    NSLog(@"!!! Received %@",buffer);
    
}


-(void) resetFifo{
    //[[NSFileManager defaultManager] removeItemAtPath:FIFO_BUFFER_FILE error:nil];
    NSString *string=@"";
    [string writeToFile:FIFO_BUFFER_FILE atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

-(void) createFifo{
    NSString *path=@"/usr/bin/mkfifo";
    NSArray *args = [NSArray arrayWithObjects: @"/tmp/cocaModem.fifo",nil];
    NSTask *task=[NSTask launchedTaskWithLaunchPath:path arguments:args];
    [task waitUntilExit];
    
    if([task terminationStatus] !=0){
        NSLog(@"Something went wrong while creating the pipe");
    }
}
@end
