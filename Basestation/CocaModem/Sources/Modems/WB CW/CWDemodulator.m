//
//  CWDemodulator.m
//  cocoaModem 2.0
//
//  Created by Kok Chen on 12/2/06.
	#include "Copyright.h"
	
	
#import "CWDemodulator.h"
#import "CMFSKTypes.h"
#import "CWMixer.h"
#import "CWMatchedFilter.h"
#import "MorseDecoder.h"
#import "FifoExporter.h"

@implementation CWDemodulator

//  copy of CMFSKPipeline
typedef struct {
	CMBandpassFilter *bandpassFilter, *originalBandpassFilter ;
	CWMixer *mixer ;
	CWMatchedFilter *matchedFilter, *originalMatchedFilter ;
	CMATC *atc ;
	MorseDecoder *decoder ;
} CWPipeline1 ;


- (void)initPipelineStages:(CMTonePair*)pair decoder:(MorseDecoder*)decoder bandwidth:(float)bandwidth
{
	CWPipeline1 *p ;
	CWMatchedFilter *matchedFilter ;
	
	isRTTY = NO ;
	tonePair = *pair ;
	p = (CWPipeline1*)( pipeline = ( void* )malloc( sizeof( CWPipeline1 ) ) ) ;
	// -- bandpass filter (none)
	p->bandpassFilter = p->originalBandpassFilter = nil ;
	//  -- CW mixer (mixes signal to I&Q baseband
	p->mixer = [ [ CWMixer alloc ] init ] ;
	[ p->mixer setTonePair:&tonePair ] ;
	[ p->mixer setAural:NO ] ;
	// -- matched filter, change baud rate to match tone pair
	matchedFilter = [ [ CWMatchedFilter alloc ] initDefaultFilterWithBaudRate:100.0 ] ;
	p->matchedFilter = p->originalMatchedFilter = matchedFilter ;
	//  -- Morse decoder, sends data back to -receivedCharacter: of self
	p->decoder = decoder ;
	//  unused CW plug-ins
	p->atc = nil ;
}

- (void)setLatency:(int)value
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	[ p->matchedFilter setLatency:value ] ;
}

- (void)setCWBandwidth:(float)bandwidth
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	//  use constant 250 Hz filter for automatic decoding
	if ( p->mixer ) [ p->mixer setCWBandwidth:300.0 ] ;
}

- (void)useMatchedFilter:(CMPipe*)mf
{
	//  matched filter bank not used in CW mode
}

- (id)initFromReceiver:(CWReceiver*)cwReceiver
{
	CMTonePair defaultTonePair = { 1500.0, 0.0, 45.45 } ;
	MorseDecoder *decoder ;

	self = [ super init ] ;
	if ( self ) {
		receiver = (RTTYReceiver*)cwReceiver ;
		delegate = nil ;
		decoder = [ [ MorseDecoder alloc ] initWithDemodulator:self ] ;
		[ self initPipelineStages:&defaultTonePair decoder:decoder bandwidth:100.0 ] ;
	}
	return self ;
}

- (void)dealloc
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;
	
	[ self setClient:nil ] ;
	[ p->decoder release ] ;
	[ p->mixer release ] ;
	//if ( p->bandpassFilter == p->originalBandpassFilter ) [ p->bandpassFilter release ] ;
	if ( p->matchedFilter == p->originalMatchedFilter ) [ p->matchedFilter release ] ;
	free( pipeline ) ;
	[ super dealloc ] ;
}

//  overide base class to change AudioPipe pipeline (assume source is normalized baud rate)
//		self = CWDemodulator (importData:)
//		. mixer
//		. "matched filter"
//		. MorseDecoder
//		. self (receivedCharacter:)

- (void)setupDemodulatorChain
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	//  connect AudioPipes
	[ p->matchedFilter setDecoder:p->decoder receiver:(CWReceiver*)receiver ] ;
	[ p->matchedFilter setClient:p->decoder ] ;
	[ p->mixer setClient:p->matchedFilter ] ;
	[ p->mixer setReceiver:(CWReceiver*)receiver ] ;
}

- (void)newClick:(float)delta
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	if ( p->matchedFilter ) [ p->matchedFilter newClick:delta ] ;
}

- (void)changeCodeSpeedTo:(int)speed
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	if ( p->matchedFilter ) [ p->matchedFilter changeCodeSpeedTo:speed ] ;
}

- (void)changeSquelchTo:(float)squelch fastQSB:(float)fast slowQSB:(float)slow
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	if ( p->matchedFilter ) [ p->matchedFilter setSquelch:squelch fastQSB:fast slowQSB:slow ] ;
}

- (void)importData:(CMPipe*)pipe
{	
	CWPipeline1 *p = (CWPipeline1*)pipeline;
	
	//  send data through the processing chain starting at the mixer
	if ( p->mixer )  [ p->mixer importData:pipe ] ;
}

- (void)receivedCharacter:(int)c
{
    [[FifoExporter instance] addReceivedBuffer:[NSString stringWithFormat:@"%c",c]];
	if ( delegate && [ delegate respondsToSelector:@selector(receivedCharacter:) ] ) [ delegate receivedCharacter:c ] ;
}

//  return a nil.
//  the BPF is no longer used in the CW mode
- (CMBandpassFilter*)makeFilter:(float)width
{
	return nil ;
}

@end
