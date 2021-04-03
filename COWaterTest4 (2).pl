#!/usr/bin/perlml

my $gauge = 'PLASPLCO';
my $waterdis = 8;
my $instruction = '>';
my $fh;
open($fh, $instruction, 'public_html/COWaterlog.txt') or die "Could not open file '$filename' $!";

# +trace generates verbose output to STDOUT, including the
# XML exchanges of the method calls.
use SOAP::Lite maptype => {} +trace=>qw(debug);
# CONSTANTS
my $NS = 'http://dnrweb.state.co.us/DWR/DwrApiService/Version';
my $URI = 'http://dnrweb.state.co.us/DWR/DwrApiService/Version';
my $SERV= 'http://dnrweb.state.co.us/DWR/DwrApiService/Version';
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');
1;

my $gauge = 'PLAGEOCO';
my $waterdis = 23;
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'CLAFTCCO';
my $waterdis = 3;
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'LAPLODCO';
my $waterdis = 3;
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'LAKATLCO';
my $waterdis = 11;
runMethod('GetSMSCurrentConditions','Div=2','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'RIOMILCO';
my $waterdis = 20;
runMethod('GetSMSCurrentConditions','Div=3','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'CONPLACO';
my $waterdis = 22;
runMethod('GetSMSCurrentConditions','Div=3','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'PLADENCO';
my $waterdis = 8;
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'PLACHECO';
my $waterdis = 80;
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'PLABAICO';
my $waterdis = 80;
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'BOCOROCO';
my $waterdis = 6;
runMethod('GetSMSCurrentConditions','Div=1','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'CCACCRCO';
my $waterdis = 11;
runMethod('GetSMSCurrentConditions','Div=2','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'KANJUNCO';
my $waterdis = 42;
runMethod('GetSMSCurrentConditions','Div=4','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'RIOSFKCO';
my $waterdis = 20;
runMethod('GetSMSCurrentConditions','Div=3','WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

my $gauge = 'EASAPACO';
my $waterdis = 29;
my $waterDIV = 7;
# runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');
# figure out why this section is not pulling data or giving an error code
print $fh "" . $gauge . "=" . "0" . "\n";

# South Boulder Creek below Gross Reservior
my $gauge = 'BOCBGRCO';
my $waterdis = 6;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# SOUTH BOULDER CREEK ABOVE GROSS RESERVOIR AT PINECLIFFE 
my $gauge = 'BOCPINCO';
my $waterdis = 6;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# BIG THOMPSON RIVER BELOW LAKE ESTES
my $gauge = 'BTBLESCO';
my $waterdis = 4;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# Willow Creek 
my $gauge = 'WILBSLCO';
my $waterdis = 58;
my $waterDIV = 6;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# NORTH SAINT VRAIN CREEK BELOW BUTTONROCK (RALPH PRICE) RESERVOIR
my $gauge = 'NSVBBRCO';
my $waterdis = 5;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# SAINT VRAIN CREEK AT LYONS, CO
my $gauge = 'SVCLYOCO';
my $waterdis = 5;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# SOUTH SAINT VRAIN NEAR WARD
my $gauge = 'SSVWARCO';
my $waterdis = 5;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# ROCK CREEK ABOVE CONFLUENCE WITH TARRYALL CREEK
my $gauge = 'RCKTARCO';
my $waterdis = 23;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# BEAR CREEK AT MORRISON 
my $gauge = 'BCRMORCO';
my $waterdis = 9;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# Frying Pan above Ruedi Res
my $gauge = 'FRYTHOCO';
my $waterdis = 38;
my $waterDIV = 5;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# Arkansas above Wellsville
my $gauge = 'ARKWELCO';
my $waterdis = 11;
my $waterDIV = 2;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

# NORTH SAINT VRAIN CREEK ABOVE BUTTONROCK (RALPH PRICE) RESERVOIR
my $gauge = 'BRKRESCO';
my $waterdis = 5;
my $waterDIV = 1;
#runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');
print $fh "" . $gauge . "=" . "0" . "\n";
# figure out why this gauge isn't even producing an error code OR leave it turned off

# MIDDLE BOULDER CREEK AT NEDERLAND (BOCMIDCO)
my $gauge = 'BOCMIDCO';
my $waterdis = 6;
my $waterDIV = 1;
runMethod('GetSMSCurrentConditions','Div=' . $waterDIV,'WD=' . $waterdis,'Abbrev=' . $gauge,'Variable=DISCHRG');

sub runMethod {
 my $method = shift;
 # Generate the SOAP::Lite obj
 my $soap = SOAP::Lite
 -> uri($NS)
  -> on_action( sub {sprintf '%s%s', @_ } )
 -> proxy($SERV);
 my @params;
 my @pair;
  # Attach parameters to the method call;
  # 1st, make an array of SOAP::Data objects,
  # which is a SOAP implementation of name - value pairs.
  while (my $param = shift) {
  @pair = split(/\=/, $param);
  push(@params, SOAP::Data->name($pair[0]=>$pair[1]));
  }
  
  # Create a SOAP::Data objects for the name of the
  # method to call. Note the Web Service namespace
  # must be included.
  my $methodSoap = SOAP::Data->name($method)->attr({xmlns=>$NS});
  # Send the login request;
  # The parameters are attached to the method call here.
  # Use SOAP::SOM to parse results
 my $som = $soap->call($methodSoap=>@params);
  # Check for a fault: Call failure
  if ($som->fault) {
  my $logmsg =
  "\nFault Detail: " . $som->faultdetail . "\n" .
  "Fault Code: " . $som->faultcode . "\n" .
  "Fault String: " . $som->faultstring . "\n";
  print $logmsg;
  print $fh "" . $gauge . "=" . "0" . "\n";
 return;
 }
 # Check the Header of Envelope, look for SMSStatusHeader
 # Check that for errors returned by the service.
 my $status = $som->valueof('//SmsStatusHeader/status');
 if ($som->match('//SmsStatusHeader/error/errorCode')) {
  my $errCode = $som->valueof('//SmsStatusHeader/error/errorCode');
  my $errType = $som->valueof('//SmsStatusHeader/error/errorType');
  my $errMssg = $som->valueof('//SmsStatusHeader/error/errorMessage');
  my $errDesc = $som->valueof('//SmsStatusHeader/error/exceptionDescription');
  my $logmsg = "\nError code: $errCode\nError type: $errType" .
  "\nError: $errMssg\nException: $errDesc\n";
  print "$logmsg\n---------Failed!--------------\n\n";
  print $fh "" . $gauge . "=" . "0" . "\n";
 return;
 };

  # Parse the response, print the results
 if ($method eq 'GetSMSCurrentConditions') {
  my @results = $som->valueof('//GetSMSCurrentConditionsResult/CurrentCondition');
  my($res);
  my($cs,$csd,$rt,$rtd,$sc,$scd,$tf,$tfd,$wm,$wmd);
  print " Enumerating Conditions...\n";
  foreach $res (@results) {
   if ($res->{currentShift}) {
   $cs = $res->{currentShift};
   } else { $cs = ''; }
   if ($res->{currentShiftEffectiveDate}){
   $csd = "(" . $res->{currentShiftEffectiveDate} . ")";
   } else { $csd = ''; }
   if ($res->{ratingTable}) {
   $rt = $res->{ratingTable};
   } else { $rt = ''; }
   if ($res->{currentRatingTableEffectiveDate}) {
   $rtd = "(" . $res->{currentRatingTableEffectiveDate} . ")";
   } else { $rtd = ''; }
   if ($res->{shiftCurve}) {
   $sc = $res->{shiftCurve};
   } else { $sc = ''; }
   if ($res->{currentShiftCurveEffectiveDate}) {
   $scd = "(" . $res->{currentShiftCurveEffectiveDate} . ")";
   } else { $scd = ''; }
   if ($res->{transFlag}) {
   $tf = $res->{transFlag};
   } else { $tf = ''; }
   if ($res->{transFlagDescr}) {
   $tfd = "(" . $res->{transFlagDescr} . ")";
   } else { $tfd = ''; }
   if ($res->{webMessage}) {
   $wm = $res->{webMessage};
   } else { $wm = ''; }
   if ($res->{webMessageDescr}) {
   $wmd = "(" . $res->{webMessageDescr} . ")";
   } else { $wmd = ''; }
   print "\n " . $res->{abbrev} . ": Div" . $res->{'div'} . "; WD" . $res->{'wd'} .
   "\n Variable: " . $res->{variable} .
   "\n Trans Date: " . $res->{transDateTime} .
   "\n Gage Ht: " . $res->{gageHeight} .
   "\n Amount: " . $res->{amount} .
   "\n TransFlag: $tf $tfd" .
   "\n WebMessage: $wm $wmd" .
   "\n dataSource: " . $res->{dataSource} .
   "\n CurrShift: $cs $csd" .
   "\n Rating Table: $rt $rtd \n";
   "\n [ " , $res->{abbrev}, ", " , $res->{amount} , " ]";
   print "\n [ " . $res->{abbrev} . ", " , $res->{amount} . " ]";
   print $fh "" . $res->{abbrev} . "=" , $res->{amount} . "\n";
  }
  
  print "\n\n --------------COMPLETE--------------\n\n";
  } else {
  	print $fh "" . $gauge . "=" . "0" . "\n";
  }
}
