//
//  CWAuralFilter.m
//  cocoaModem 2.0
//
//  Created by Kok Chen on 1/11/07.
	#include "Copyright.h"
	

#import "CWAuralFilter.h"
#import "CWMixer.h"
#import "CWMatchedFilter.h"
#import "CMFSKTypes.h"


@implementation CWAuralFilter

//  copy of CMFSKPipeline
typedef struct {
	CMBandpassFilter *bandpassFilter, *originalBandpassFilter ;
	CWMixer *mixer ;
	CWMatchedFilter *matchedFilter, *originalMatchedFilter ;
	CMATC *atc ;
	MorseDecoder *decoder ;
} CWPipeline1 ;



//  NOTE: the aural filter does not have a morse decoder pipeline
- (void)initPipelineStages:(CMTonePair*)pair decoder:(MorseDecoder*)decoder bandwidth:(float)bandwidth
{
	CWPipeline1 *p ;
	
	tonePair = *pair ;
	p = (CWPipeline1*)( pipeline = ( void* )malloc( sizeof( CWPipeline1 ) ) ) ;
	// -- bandpass filter (none)
	p->bandpassFilter = p->originalBandpassFilter = nil ;
	//  -- CW mixer (mixes signal to I&Q baseband)
	p->mixer = [ [ CWMixer alloc ] init ] ;
	[ p->mixer setTonePair:&tonePair ] ;
	[ p->mixer setAural:YES ] ;
	//  unused plug-ins aural filter
	p->decoder = nil ;
	p->atc = nil ;
	p->matchedFilter = p->originalMatchedFilter = nil ;
}

- (void)setCWBandwidth:(float)bandwidth
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	if ( p->mixer ) [ p->mixer setCWBandwidth:bandwidth ] ;
}

- (id)initFromReceiver:(CWReceiver*)cwReceiver
{
	CMTonePair defaultTonePair = { 1500.0, 0.0, 45.45 } ;

	self = [ super init ] ;
	if ( self ) {
		receiver = (RTTYReceiver*)cwReceiver ;
		delegate = nil ;
		[ self initPipelineStages:&defaultTonePair decoder:nil bandwidth:100.0 ] ;
	}
	return self ;
}

- (void)dealloc
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;
	
	[ self setClient:nil ] ;
	[ p->mixer release ] ;
	free( pipeline ) ;
	[ super dealloc ] ;
}

//  overide base class to change AudioPipe pipeline (assume source is normalized baud rate)
//		self = CWDemodulator (importData:)
//		. mixer
//		. aural monitor

- (void)setupDemodulatorChain
{
	CWPipeline1 *p = (CWPipeline1*)pipeline;

	//  connect AudioPipes (only mixer is used)
	[ p->mixer setReceiver:(CWReceiver*)receiver ] ;
}

@end
