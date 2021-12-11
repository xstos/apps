var request = require('request');
var fs = require('fs');
const apikey = 'alphavantage api key here'
const symbols = `
AAB\tAberdeen International Inc
AAV\tAdvantage Oil & Gas Ltd
ABCT\tABC Technologies Holdings Inc
ABST\tAbsolute Software Corp
ABX\tBarrick Gold Corp
AC\tAir Canada
ACB\tAurora Cannabis Inc
ACD\tAccord Financial
ACQ\tAutocanada Inc
ADCO\tAdcore Inc
ADN\tAcadian Timber Corp
AEG\tAegis Brands Inc
AEM\tAgnico Eagle Mines Limited
AEZS\tAeterna Zentaris Inc
AFN\tAg Growth International Inc
AGI\tAlamos Gold Inc Cls A
AH\tAleafia Health Inc
AHC\tApollo Healthcare Corp.
AI\tAtrium Mortgage Investment Corp
AIF\tAltus Group Limited
AII\tAlmonty Industries Inc
AIM\tAimia Inc
AJX\tAgjunction Inc
AKU\tAkumin Inc
ALA\tAltagas Ltd
ALC\tAlgoma Central
ALS\tAltius Minerals Corp
ALYA\tAlithya Group
AMM\tAlmaden Minerals Ltd
AND\tAndlauer Healthcare Group Inc
ANRG\tAnaergia Inc
ANX\tAnaconda Mining Inc
AOI\tAfrica Oil Corp
AOT\tAscot Resources Ltd
APLI\tAppili Therapeutics Inc
APS\tAptose Biosciences Inc
APY\tAnglo Pacific Group Plc
AQA\tAquila Resources Inc
AQN\tAlgonquin Power and Utilities Corp
AR\tArgonaut Gold Inc
ARE\tAecon Group Inc
ARG\tAmerigo Resources Ltd
ARIS\tAris Gold Corp
ARR\tAltius Renewable Royalties Corp
ARX\tArc Resources Ltd
ASM\tAvino Silver and Gold Mines Ltd
ASND\tAscendant Resources Inc
ASP\tAcerus Pharmaceuticals Corp
AT\tAcuityads Holdings Inc
ATA\tAts Automation
ATE\tAntibe Therapeutics Inc
ATH\tAthabasca Oil Corp
ATZ\tAritzia Inc
AUMN\tGolden Minerals Company
AUP\tAurinia Pharmaceuticals Inc
AVL\tAvalon Advanced Materials Inc
AVNT\tAvant Brands Inc
AVP\tAvcorp Industries Inc
AXU\tAlexco Resource Corp
AYA\tAya Gold and Silver Inc
AYM\tAtalaya Mining Plc
AZG\tArizona Gold Corp
AZZ\tAzarga Uranium Corp
BAMR\tBrookfield Asset Management Re Part Ltd
BB\tBlackberry Limited
BBTV\tBbtv Holdings Inc.
BCE\tBCE Inc
BDGI\tBadger Infrastructure Solutions Ltd
BDI\tBlack Diamond Group Ltd
BDT\tBird Construction Inc
BEPC\tBrookfield Renewable Corporation
BHC\tBausch Health Companies Inc
BIPC\tBrookfield Infrastructure Corporation
BIR\tBirchcliff Energy Ltd
BK\tCanadian Banc Corp
BKI\tBlack Iron Inc
BLDP\tBallard Power Systems Inc
BLN\tBlackline Safety Corp
BLU\tBellus Health Inc
BLX\tBoralex Inc
BMO\tBank of Montreal
BNE\tBonterra Energy Corp
BNG\tBengal Energy Ltd
BNK\tBankers Petroleum Ltd.
BNS\tBank of Nova Scotia
BOS\tAirboss America J
BR\tBig Rock Brewery Inc
BRAG\tBragg Gaming Group Inc
BRE\tBridgemarq Real Estate Services Inc.
BRMI\tBoat Rocker Media Inc
BRY\tBri Chem Corp
BSX\tBelo Sun Mining Corp
BTE\tBaytex Energy Corp
BTO\tB2Gold Corp
BU\tBurcon Nutrascience Corp
BUI\tBuhler Ind
BYD\tBoyd Group Services Inc
BYL\tBaylin Technologies Inc
CAE\tCae Inc
CARE\tDialogue Health Technologies Inc
CAS\tCascades Inc
CCA\tCogeco Communications Inc
CCM\tCanagold Resources Ltd
CCO\tCameco Corp
CDAY\tCeridian Hcm Holdings Inc
CEE\tCentamin Plc
CEF\tSprott Physical Gold Silver Trust
CERV\tCervus Equipment Corp
CET\tCathedral Energy Services Ltd
CEU\tCes Energy Solutions Corp
CF\tCanaccord Genuity Group Inc
CFF\tConifex Timber Inc
CFP\tCanfor Corp
CFW\tCalfrac Well Services Ltd
CFX\tCanfor Pulp Products Inc
CG\tCenterra Gold Inc
CGG\tChina Gold Int Resources Corp
CGI\tCDN General Inv
CGO\tCogeco Inc Sv
CGX\tCineplex Inc
CGY\tCalian Group Ltd
CHR\tChorus Aviation Inc
CHW\tChesswood Group Limited
CIA\tChampion Iron Limited
CIGI\tColliers International Group Inc
CIX\tCI Financial Corp
CJ\tCardinal Energy Ltd
CJT\tCargojet Inc
CKI\tClarke Inc
CLIQ\tAlcanna Inc
CLMT\tPurpose Global Climate Opportunities Fun
CLS\tCelestica Inc Sv
CM\tCanadian Imperial Bank of Commerce
CMG\tComputer Modelling Group Ltd
CMMC\tCopper Mountain Mining Corp
CNE\tCanacol Energy Ltd
CNQ\tCDN Natural Res
CNR\tCanadian National Railway Co.
CNT\tCentury Global Commodities Corp
CNU\tCnooc Limited
COG\tCondor Gold Plc
CP\tCanadian Pacific Railway Limited
CPG\tCrescent Point Energy Corp
CPH\tCipher Pharmaceuticals Inc
CPI\tCondor Petroleum Inc
CPX\tCapital Power Corp
CR\tCrew Energy Inc
CRDL\tCardiol Therapeutics Inc
CRON\tCronos Group Inc
CRP\tCeres Global Ag Corp
CRRX\tCarerx Corporation
CRWN\tCrown Capital Partners Inc
CS\tCapstone Mining Corp
CSM\tClearstream Energy Services Inc
CSU\tConstellation Software Inc
CTC\tCanadian Tire Corporation Limited
CTS\tConverge Technology Solutions Corp
CTX\tCrescita Therapeutics Inc
CU\tCanadian Utilities Ltd Cl.A NV
CVE\tCenovus Energy Inc
CVG\tClairvest Group
CWB\tCDN Western Bank
CWEB\tCharlotte's Web Holdings Inc
CWL\tCaldwell Partners International Inc
CXB\tCalibre Mining Corp
CXI\tCurrency Exchange International Corp
CYB\tCymbria Corporation Cl A
DBM\tDoman Building Materials Group Ltd
DBO\tDbox Technologies Inc
DCBO\tDocebo Inc
DCM\tData Communications Mgmt Corp
DF\tDividend 15 Split Corp II
DFN\tDividend 15 Split Corp
DGS\tDividend Growth Split Corp Class A
DIAM\tStar Diamond Corp
DIV\tDiversified Royalty Corp
DML\tDenison Mines Corp
DN\tDelta 9 Cannabis Inc
DND\tDye & Durham Ltd
DNG\tDynacor Gold Mines Inc
DNT\tCandente Copper Corp
DNTL\tDentalcorp Holdings Ltd
DOL\tDollarama Inc
DOO\tBrp Inc
DPM\tDundee Precious Metals Inc
DR\tMedical Facilities Corp
DRCU\tDesjardins RI Active Canadian Bond-Low C
DRDR\tMci Onehealth Technologies Inc
DRM\tDream Unlimited Corp
DRT\tDirtt Environmental Solutions Ltd
DRX\tAdf Group Inc Sv
DS\tDividend Select 15 Corp
DSG\tDescartes Sys
DXT\tDexterra Group Inc
DYA\tDynacert Inc
E\tEnterprise Group Inc
ECN\tEcn Capital Corp
ECO\tEcosynthetix Inc
EDR\tEndeavour Silver Corp
EDT\tSpectral Medical Inc
EDV\tEndeavour Mining Corp
EFL\tElectrovaya Inc
EFN\tElement Fleet Management Corp
EFR\tEnergy Fuels Inc
EFX\tEnerflex Ltd
EGLX\tEnthusiast Gaming Holdings Inc
EIF\tExchange Income Corp
ELD\tEldorado Gold
ELEF\tSilver Elephant Mining Corporation
ELF\tE-L Financial
ELR\tEastern Platinum Limited
EMA\tEmera Incorporated
ENB\tEnbridge Inc
ENGH\tEnghouse Systems Limited
ENS\tE Split Corp
EOX\tEuromax Resources Ltd
EPRX\tEupraxia Pharmaceuticals Inc
EQB\tEquitable Group Inc
EQX\tEquinox Gold Corp
ERD\tErdene Resource Development Corp
ERF\tEnerplus Corp
ERO\tEro Copper Corp
ESI\tEnsign Energy Services Inc
ESM\tEuro Sun Mining Inc
ESN\tEssential Energy Services Ltd
ET\tEvertz Technologies Limited
ETG\tEntree Resources Ltd
ETX\tEtrion Corp
EVT\tEconomic Investment
EXE\tExtendicare Inc
EXF\tExfo Inc
EXN\tExcellon Resources Inc
EXRO\tExro Technologies Inc
FAF\tFire & Flower Holdings Corp.
FAP\tAberdeen Asia-Pacific Income Invest Ltd
FAR\tForaco International Sa
FC\tFirm Capital Mortgage Inv. Corp
FCRH\tFidelity US Div Rising Rates Cur Neu Idx
FCU\tFission Uranium Corp
FDGE\tFarmers Edge Inc
FEC\tFrontera Energy Corp
FF\tFirst Mining Gold Corp
FFH\tFairfax Financial Holdings Ltd
FFN\tNorth American Financial 15 Split Corp
FLOW\tFlow Beverage Corp
FM\tFirst Quantum Minerals Ltd
FN\tFirst National Financial Corp
FNV\tFranco-Nevada Corp
FOOD\tGoodfood Market Corp
FORA\tVerticalscope Holdings Inc
FORZ\tForza Petroleum Limited
FR\tFirst Majestic Silver Corp Common
FRII\tFreshii Inc
FRU\tFreehold Royalties Ltd
FRX\tFennec Pharmaceuticals Inc
FSV\tFirstservice Corp
FSY\tForsys Metals Corp
FSZ\tFiera Capital Corp
FT\tFortune Mnrl J
FTG\tFiran Technology Group Corp
FTN\tFinancial 15 Split Corp
FTRP\tField Trip Health Ltd.
FTS\tFortis Inc
FTT\tFinning Intl
FTU\tUS Financial 15 Split Corp
FURY\tFury Gold Mines Limited
FVI\tFortuna Silver Mines Inc
FVL\tFreegold Ventures Limited
FXC\tFax Capital Corp
G\tAugusta Gold Corp
GATO\tGatos Silver Inc
GAU\tGaliano Gold Inc
GBAR\tMonarch Mining Corporation
GBT\tBmtc Group Inc
GC\tGreat Canadian Gaming Corp
GCG\tGuardian Capital
GCL\tColabor Group Inc
GCM\tGran Colombia Gold Corp
GCSC\tGuardian Canadian Sector Controlled Equi
GDC\tGenesis Land J
GDI\tGdi Integrated Facility Services Inc
GDL\tGoodfellow Inc
GDV\tGlobal Dividend Growth Split Corp
GEI\tGibson Energy Inc
GENM\tGeneration Mining Limited
GEO\tGeodrill Limited
GFL\tGfl Environmental Inc
GGA\tGoldgroup Mining Inc
GGD\tGogold Resources Inc
GH\tGamehost Inc
GIL\tGildan Activewear Inc
GLG\tGlg Life Tech Corp
GLO\tGlobal Atomic Corp
GLXY\tGalaxy Digital Holdings Ltd
GMX\tGlobex Mining Enterprises Inc
GOLD\tGoldmining Inc
GOOS\tCanada Goose Holdings Inc
GPR\tGreat Panther Silver Limited
GRA\tNanoxplore Inc
GRC\tGold Springs Resource Corp
GRID\tTantalus Systems Holding Inc
GRN\tGreenlane Renewables Inc
GSC\tGolden Star
GSV\tGold Standard Ventures Corp
GSY\tGoeasy Ltd
GTE\tGran Tierra Energy Inc
GTMS\tGreenbrook Tms Inc
GUD\tKnight Therapeutics Inc
GURU\tGuru Organic Energy Corp
GVC\tGlacier Media Inc
GWO\tGreat-West Lifeco Inc
GWR\tGlobal Water Resources Inc
GXE\tGear Energy Ltd
H\tHydro One Limited
HAI\tHaivision Systems Inc
HBM\tHudbay Minerals Inc
HBP\tHelix Biopharm
HCG\tHome Capital Group Inc
HDI\tHardwoods Distribution Inc
HE\tHanwei Energy Services Corp
HEXO\tHexo Corp
HLF\tHigh Liner
HLS\tHls Therapeutics Inc
HRT\tHarte Gold Corp
HRX\tHeroux-Devtek
HSM\tHelius Medical Technologies Inc
HUM\tHamilton U.S. Mid/Small-Cap Financials E
HUT\tHut 8 Mining Corp
HWO\tHigh Arctic Energy Services Inc
HWX\tHeadwater Exploration Inc
HZM\tHorizonte Minerals Plc
IAG\tIA Financial Corporation Inc.
IAU\tI-80 Gold Corp.
IBG\tIbi Group Inc
ICE\tCanlan ICE Sports Corp
ICPB\tIA Clarington Core Plus Bond Fund
IDG\tIndigo Books & Music Inc
IFA\tIfabric Corp
IFC\tIntact Financial Corp
IFP\tInterfor Corp
IGCF\tPimco Investment Grade Credit Fund
IGLB\tIA Clarington Global Bond Fund
IGM\tIgm Financial Inc
III\tImperial Metals Corp
IMG\tIamgold Corp
IMO\tImperial Oil
IMP\tIntermap Tech Corp
IMV\tImv Inc.
INE\tInnergex Renewable Energy Inc
INQ\tInscape Corp Sv
INV\tInv Metals Inc
IPCI\tIntellipharmaceutics International Inc
IPCO\tInternational Petroleum Corp
IPL\tInter Pipeline Ltd
IPO\tInplay Oil Corp
ISV\tInformation Services Corp
ITE\tI3 Energy Plc
ITH\tInternational Tower Hill Mines Ltd
ITP\tIntertape Polymer
IVN\tIvanhoe Mines Ltd
IVQ\tInvesque Inc CAD
JAG\tJaguar Mining Inc
JOSE\tJosemaria Resources Inc
JOY\tJourney Energy Inc
JWEL\tJamieson Wellness Inc
K\tKinross Gold Corp
KBL\tKbro Linen Inc
KEI\tKolibri Global Energy Inc
KEL\tKelt Exploration Ltd
KEY\tKeyera Corp
KILO\tPurp Gold Bullion Tu
KITS\tKits Eyecare Ltd
KL\tKirkland Lake Gold Ltd
KLS\tKelso Technologies Inc
KNT\tK92 Mining Inc
KOR\tCorvus Gold Inc
KPT\tKp Tissue Inc
KRN\tKarnalyte Resources Inc
KRR\tKarora Resources Inc.
KXS\tKinaxis Inc
L\tLoblaw CO
LABS\tMedipharm Labs Corp
LAC\tLithium Americas Corp
LAM\tLaramide Resources Ltd
LB\tLaurentian Bank
LBS\tLife & Banc Split Corp
LCS\tBrompton Lifeco Split Corp Class A
LEAF\tLeaf Mobile Inc
LEV\tLion Electric CO [The]
LFE\tCanadian Life Companies Split Corp
LGD\tLiberty Gold Corp
LGO\tLargo Resources Ltd
LIF\tLabrador Iron Ore Royalty Corp
LN\tLoncor Gold Inc
LNF\tLeons Furniture
LNR\tLinamar Corp
LOCL\tFreshlocal Solutions Inc
LPEN\tLoop Energy Inc
LSPD\tLightspeed Pos Inc
LSPK\tLifespeak Inc
LUC\tLucara Diamond Corp
LUG\tLundin Gold Inc
LUN\tLundin Mining Corp
LWRK\tLifeworks Inc
LXR\tLxrandco Inc
MAG\tMAG Silver Corp
MAGT\tMagnet Forensics Inc
MAL\tMagellan Aero
MARI\tMarimaca Copper Corp
MAV\tMav Beauty Brands Inc
MAW\tMawson Resources Ltd
MAXR\tMaxar Technologies Inc
MBA\tCibt Education Group Inc
MBCN\tMindbeacon Holdings Inc
MBN\tMbn Corp
MBX\tMicrobix J
MCB\tMccoy Global Inc
MDA\tMda Ltd
MDF\tMdf Commerce Inc.
MDI\tMajor Drilling Grp
MDNA\tMedicenna Therapeutics Corp
MDP\tMedexus Pharmaceuticals Inc
ME\tMoneta Porcupine J
MEG\tMeg Energy Corp
MEQ\tMainstreet Eq J
MFC\tManulife Fin
MFI\tMaple Leaf Foods
MG\tMagna International Inc
MGA\tMega Uranium Ltd
MIN\tExcelsior Mining Corp
MKP\tMcan Mortgage Corp
MMX\tMaverix Metals Inc
MND\tMandalay Resources Corp
MNS\tRoyal CDN Mint CDN Silver Reserves Etr
MNT\tRoyal Canadian Mint CDN Gold Reserves
MOGO\tMogo Inc
MOZ\tMarathon Gold Corp
MPC\tMadison Pac Cl B
MPVD\tMountain Province Diamonds Inc
MRC\tMorguard Corp
MRD\tMelcor Dev
MRE\tMartinrea International Inc
MRU\tMetro Inc
MRV\tNuvo Pharmaceuticals Inc
MSV\tMinco Silver Corp
MTL\tMullen Group Ltd
MTY\tMty Food Group Inc
MUX\tMcewen Mining Inc
MVP\tMediavalet Inc
MX\tMethanex Corp
MXG\tMaxim Power Corp
NA\tNational Bank of Canada
NANO\tNano One Materials Corp
NB\tNiocorp Developments Ltd
NBLY\tNeighbourly Pharmacy Inc
NCF\tNorthcliff Resources Ltd
NCM\tNewcrest Mining Limited
NCP\tNickel Creek Platinum Corp
NCU\tNevada Copper Corp
NDM\tNorthern Dynasty Minerals Ltd
NEO\tNEO Performance Materials Inc
NEPT\tNeptune Wellness Solutions Inc
NEXA\tNexa Resources S.A.
NEXT\tNextsource Materials Inc
NFI\tNew Flyer Industries Inc
NG\tNovagold Res Inc
NGD\tNew Gold Inc
NGT\tNewmont Corp.
NHK\tNighthawk Gold Corp
NOA\tNorth American Construction Group Ltd.
NOVC\tNova Cannabis Inc
NPI\tNorthland Power Inc
NPK\tVerde Agritech Plc
NSR\tNomad Royalty Company Ltd.
NTR\tNutrien Ltd
NUAG\tNew Pacific Metals Corp
NVA\tNuvista Energy Ltd
NVCN\tNeovasc Inc
NVEI\tNuvei Corporation
NVO\tNovo Resources Corp
NWC\tThe North West Company Inc
NXE\tNexgen Energy Ltd
NXJ\tNexj Systems Inc
NZC\tNorzinc Ltd
OBE\tObsidian Energy Ltd
OGC\tOceanagold Corp
OGD\tOrbit Garant Drilling Inc
OGI\tOrganigram Holdings Inc
OLA\tOrla Mining Ltd
OLY\tOlympia Financial Group Inc
OMI\tOrosur Mining Inc
ONC\tOncolytics Bio
ONEX\tOnex Corp
OPS\tOpsens Inc
OPT\tOptiva Inc
OR\tOsisko Gold Royalties Ltd
ORA\tAura Minerals Inc
OREA\tOrea Mining Corp
ORL\tOrocobre Limited
ORV\tOrvana Minerals J
OSK\tOsisko Mining Inc
OSP\tBrompton Oil Split Corp
OTEX\tOpen Text Corp
OVV\tOvintiv Inc
PAAS\tPan American Silver Corp
PAT\tPatriot One Technologies Inc
PAY\tPayfare Inc
PBH\tPremium Brands Holdings Corp
PBL\tPollard Banknote Limited
PD\tPrecision Drilling Corp
PDV\tPrime Dividend Corp Cl A
PEA\tPieridae Energy Ltd
PET\tPet Valu Holdings Ltd
PEY\tPeyto Exploration and Dvlpmnt Corp
PFB\tPfb Corp
PFSS\tPicton Mahoney Fort Special Sit Alt Fund
PHO\tPhoton Control Inc
PHX\tPhx Energy Services Corp
PHYS\tSprott Physical Gold Trust CAD
PIF\tPolaris Infrastructure Inc
PINC\tPurpose Multi Asset Income Fund
PINV\tPurpose Global Innovators Fund
PIPE\tPipestone Energy Corp
PKI\tParkland Fuel Corp
PLC\tPark Lawn Corp
PME\tSentry Select Primary Metals Corp
PMIF\tPimco Monthly Income Fund
PMM\tPurpose Multi Strategy Mkt Neutral Fund
PMN\tPromis Neurosciences Inc
PMT\tPerpetual Energy Inc
PMTS\tCPI Card Group Inc
PNE\tPine Cliff Energy Ltd
PNP\tPinetree Capital Ltd
POM\tPolymet Mining Corp
POU\tParamount Resources Ltd
POW\tPower Corporation of Canada Sv
PPL\tPembina Pipeline Corp
PPR\tPrairie Provident Resources Inc
PPTA\tPerpetua Resources Corp
PREF\tEvolve Dvdnd Stblt Prf Sh Indx E
PRM\tBig Pharma Split Corp
PRMW\tPrimo Water Corporation
PRN\tProfound Medical Corp
PRQ\tPetrus Resources Ltd
PRU\tPerseus Mining Limited
PSD\tPulse Seismic Inc
PSI\tPason Systems Inc
PSK\tPrairiesky Royalty Ltd
PSLV\tSprott Physical Silver Trust CAD
PTM\tPlatinum Group Metals Ltd
PTS\tPoints International Ltd
PVG\tPretium Resources Inc
PWI\tSustainable Power Infra Split Corp Cl A
PXT\tParex Resources Inc
PYR\tPyrogenesis Canada Inc
PZA\tPizza Pizza Royalty Corp
QAH\tMackenzie US Large Cap Eqty Idx CAD Hgd
QBTC\tThe Bitcoin Fund CAD
QEC\tQuesterre Energy Corp
QSR\tRestaurant Brands International Inc
QTRH\tQuarterhill Inc
QUIG\tMackenzie US Inv Grd Corp Bd Idx CAD Hgd
RBA\tRitchie Bros Auctioneers Inc
RCG\tRF Capital Group Inc
RCH\tRichelieu Hardware Ltd
RDL\tRedline Communications Group Inc
REAL\tReal Matters Inc
RECP\tRecipe Unlimited Corp
RFP\tResolute Forest Products Inc
RIV\tCanopy Rivers Inc
RNW\tTransalta Renewables Inc
ROOT\tRoots Corporation
ROXG\tRoxgold Inc
RS\tReal Estate and Ecommerce Split Corp
RSI\tRogers Sugar Inc
RTG\tRtg Mining Inc
RUS\tRussel Metals
RVX\tResverlogix Corp
RY\tRoyal Bank of Canada
S\tSherritt Intl Rv
SAM\tStarcore International Mines Ltd
SAP\tSaputo Inc
SAU\tST Augustine Gold and Copper Ltd
SBB\tSabina Gold and Silver Corp
SBC\tBrompton Split Banc Corp Cl A
SBI\tSerabi Gold Plc
SBN\tS Split Corp Cl.A
SBR\tSilver Bear Resources Plc
SCL\tShawcor Ltd
SCR\tScore Media and Gaming Inc
SCY\tScandium International Mining Corp
SEA\tSeabridge Gold Inc
SEC\tSenvest Capital
SES\tSecure Energy Services Inc
SFC\tSagicor Financial Company Ltd
SFD\tNxt Energy Solutions Inc
SFTC\tSoftchoice Corporation
SGQ\tSouthgobi Resources Ltd
SGY\tSurge Energy Inc
SHLE\tSource Energy Services Ltd
SHOP\tShopify Inc
SIA\tSienna Senior Living Inc
SII\tSprott Inc
SIL\tSilvercrest Metals Inc
SIS\tSavaria Corp
SJ\tStella Jones Inc
SKE\tSkeena Resources Limited
SLF\tSun Life Financial Inc
SLR\tSolitario Zinc Corp
SLS\tSolaris Resources Inc
SMA\tStandard Mercantile Acq Corp
SMC\tSulliden Mining Capital Inc
SMT\tSierra Metals Inc
SNC\tSnc-Lavalin Sv
SOLG\tSolgold Plc
SOY\tSunopta Inc
SPB\tSuperior Plus Corp
SPG\tSpark Power Group Inc
SPPP\tSprott Physical Platinum Palladium CAD
SRX\tStorm Resources Ltd
SSL\tSandstorm Gold Ltd
SSRM\tSsr Mining Inc
STCK\tStack Capital Group Inc
STEP\tStep Energy Services Ltd
STGO\tSteppe Gold Ltd
STLC\tStelco Holdings Inc
STN\tStantec Inc
SU\tSuncor Energy Inc
SVB\tSilver Bull Resources Inc
SVM\tSilvercorp Metals Inc
SW\tSierra Wireless
SWP\tSwiss Water Decaffeinated Coffee Inc
SXI\tSynex Intl J
SXP\tSupremex Inc
SYLD\tPurpose Strategic Yield Fund
SYZ\tSylogist Ltd
SZLS\tStagezero Life Sciences Ltd.
T\tTelus Corp
TA\tTransalta Corp
TAIG\tTaiga Motors Corp
TBL\tTaiga Building Products Ltd
TBP\tTetra Bio Pharma Inc
TC\tTucows Inc
TCN\tTricon Capital Group Inc
TCS\tTecsys Inc J
TCSB\tTD Select Short Term Corporate Bond Ladd
TCW\tTrican Well
TD\tToronto-Dominion Bank
TEV\tTervita Corporation
TF\tTimbercreek Financial Corp
TFII\tTfi International Inc
TFPM\tTriple Flag Precious Metals Corp
TGL\tTransglobe Energy Corp
TGO\tTerago Inc
TGOD\tThe Green Organic Dutchman Holdings Ltd
TH\tTheratechnologies
THNC\tThinkific Labs Inc
TI\tTitan Mining Corporation
TIH\tToromont Ind
TIXT\tTelus International [Cda] Inc
TKO\tTaseko Mines Ltd
TLG\tTroilus Gold Corp
TLO\tTalon Metals Corp
TLRY\tTilray Inc
TMD\tTitan Medical Inc
TML\tTreasury Metals Inc
TMQ\tTrilogy Metals Inc
TNX\tTanzanian Royalty Exploration Corp
TOT\tTotal Energy Services Inc
TOU\tTourmaline Oil Corp
TOY\tSpin Master Corp
TPZ\tTopaz Energy Corp
TRI\tThomson Reuters Corp
TRIL\tTrillium Therapeutics Inc
TRL\tTrilogy International Partners Inc
TRP\tTc Energy Corp
TRQ\tTurquoise Hill Resources Ltd
TRZ\tTransat At Inc
TSK\tTalisker Resources Ltd
TSL\tTree Island Steel Ltd
TSU\tTrisura Group Ltd
TUSB\tTD Select U.S. Short Term Corporate Bond
TV\tTrevali Mining Corp
TVE\tTamarack Valley Energy Ltd
TVK\tTerravest Capital Inc
TWC\tTwc Enterprises Limited
TWM\tTidewater Midstream and Infras Ltd
TXG\tTorex Gold Resources Inc
TXP\tTouchstone Exploration Inc
U\tUranium Participation CO
UEX\tUex Corp
UFS\tDomtar Corp
UNC\tUnited Corp Ltd
UNI\tUnisync Corp Class B
UNS\tUni Select Inc
URB\tUrbana Corporation
URE\tUr-Energy Inc
USA\tAmericas Silver Corp
VB\tVersabank
VCM\tVecima Networks Inc
VET\tVermilion Energy Inc
VFF\tVillage Farms International Inc
VGCX\tVictoria Gold Corp
VGZ\tVista Gold Corp
VIVO\tVivo Cannabis Inc
VLE\tValeura Energy Inc
VLN\tVelan Inc Sv
VLNS\tValens Groworks Corp
VMD\tViemed Healthcare Inc
VNP\t5N Plus Inc
VQS\tViq Solutions Inc
WBR\tWaterloo Brewing Ltd.
WCN\tWaste Connections Inc
WCP\tWhitecap Resources Inc
WDO\tWesdome Gold Mines Ltd
WEED\tCanopy Growth Corp
WEF\tWestern Forest Products Inc
WELL\tWell Health Technologies Corp
WFC\tWall Financial
WFG\tWest Fraser Timber CO Ltd
WFS\tWorld Financial Split Corp
WILD\tWildbrain Ltd.
WJX\tWajax Corp
WLLW\tWillow Biosciencesinc
WM\tWallbridge Mining Company Ltd
WN\tWeston George
WOMN\tBMO Women IN Leadership Fund
WPK\tWinpak Ltd
WPM\tWheaton Precious Metals Corp
WPRT\tWestport Fuel Systems Inc
WRG\tWestern Energy Services Corp
WRN\tWestern Copper and Gold Corp
WRX\tWestern Resources Corp
WSP\tWSP Global Inc
WTE\tWestshore Terminals Investment Corp
X\tTmx Group Limited
XAM\tXanadu Mines Ltd
XAU\tGoldmoney Inc
XBC\tXebec Adsorption Inc
XCT\tExactearth Ltd
XFA\tIshares Edge MSCI Multifact USA Idx CAD
XFF\tIshares Edge MSCI Multifact EAFE Idx CAD
XLY\tAuxly Cannabis Group Inc
XTC\tExco Tech
XTD\tTdb Split Corp Class A Shares
XTG\tXtra Gold Resources Corp
Y\tYellow Pages Limited
YCM\tCommerce Split Corp Capital Shares
YGR\tYangarra Resources Ltd
YRB\tYorbeau Resources Inc
YRI\tYamana Gold Inc
ZCPB\tBMO Core Plus Bond Fund
ZFC\tBMO Sia Focused Canadian Equity Fund
ZFN\tBMO Sia Focused North American Equity Fu
ZGSB\tBMO Global Strategic Bond Fund
ZMSB\tBMO Global Multi Sector Bond Fund
ZMU\tBMO Mid Term US IG Corp Bd Hgd CAD Idx
ZZZ\tSleep Country Canada Holdings Inc
U.U\tSprott Physical Uranium Trust USD
AD.DB\tAlaris Royalty Corp 5.50 Pct Debs
AH.DB\tAleafia Health Inc 8.50 Pct Debs
AI.DB.C\tAtrium Mortgage Inv Corp 5.30 Pct Debs
AI.DB.D\tAtrium Mortgage Inv Corp 5.50 Pct Debs
AI.DB.E\tAtrium Mortgage Inv Corp 5.60 Pct Debs
AR.DB.U\tArgonaut Gold Inc. 4.625%
CU.X\tCDN Util Cl B
DC.A\tDundee Corp Cl.A Sv
DN.DB\tDelta 9 Cannabis Inc 8.5 Pct Debs
FC.DB.E\tFirm Cap Mtg Invest Corp 5.30 Pct Debs
FC.DB.F\tFirm Capital Mortgage 5.50 Pct Debs
FC.DB.G\tFirm Capital Mortgage Inv 5.20 Pct Debs
FC.DB.H\tFirm Capital Mortgage 5.30 Pct Debs
FC.DB.I\tFirm Capital Mtg Inv Corp 5.40 Pct Debs
FC.DB.J\tFirm Capital Mtg Inv Corp 5.5 Pct Debs
GC.DB\tGreat Canadian Gaming Corp 5.25 Pct Debs
MR.DB.A\tMelcor REIT 5.25 Pct Debs
MR.DB.B\tMelcor REIT 5.1 Pct Debs
OR.DB\tOsisko Gold Royalties Ltd 4.00 Pct Debs
TD.PF.A\tTD Bank Pref Ser 1
TD.PF.B\tTD Bank Pref Ser 3
TD.PF.C\tTD Bank Pref Ser 5
TD.PF.D\tTD Bank Pref Ser 7
TD.PF.E\tTD Bank Pref Ser 9
TD.PF.H\tTD Bank Pref Ser 14
TD.PF.I\tTD Bank Pref Ser 16
TD.PF.J\tTD Bank Pref Series 18
TD.PF.K\tTD Bank Pref Series 20
TD.PF.L\tTD Bank Pref Series 22
TD.PF.M\tTD Bank Pref Series 24
TF.DB.B\tTimbercreek Financial Corp 5.45 Pct Debs
TF.DB.C\tTimbercreek Financial Corp 5.30 Pct Debs
TF.DB.D\tTimbercreek Financial Corp 5.25 Pct Debs
TH.DB.U\tTheratechnologies 5.75 Pct Debs
ACD.DB\tAccord Financial Corp 7.00 Pct Debs
ACO.X\tAtco Ltd Cl.I NV
ACO.Y\tAtco Ltd Cl II
ADW.A\tAndrew Peller Limited Cl.A
ADW.B\tAndrew Peller Limited Cl.B
AFN.DB.D\tAg Growth Intl Inc 4.85 Pct Debs
AFN.DB.E\tAg Growth Intl Inc 4.50 Pct Debs
AFN.DB.F\tAg Growth Intl Inc 5.4 Pct Debs
AFN.DB.G\tAg Growth Intl Inc 5.25 Pct Debs
AFN.DB.H\tAg Growth Intl Inc 5.25 Pct Debs
AGF.B\tAGF Management Ltd Cl.B NV
AKT.A\tAkita Drilling Ltd Cl.A NV
AKT.B\tAkita Cl B
ALC.DB.A\tAlgoma Central Corp 5.25 Pct Debs
ARE.DB.C\tAecon Group Inc 5.0 Pct Debs
ATD.A\tAlimentation Couche-Tard Inc Cl A Mv
ATD.B\tAlimentation Couche-Tard Inc Cl B Sv
BAM.A\tBrookfield Asset Management Inc Cl.A Lv
BAM.PF.A\tBrookfield Asset Mgmt Inc Pref Ser 32
BAM.PF.B\tBrookfield Asset Mgmt Inc Pref Ser 34
BAM.PF.C\tBrookfield Asset Mgmt Inc Pref Ser 36
BAM.PF.D\tBrookfield Asset Mgmt Inc Pr Ser 37
BAM.PF.E\tBrookfield Asset Mgmt Pref Ser 38
BAM.PF.F\tBrookfield Asset Mgmt Inc Pref Ser 40
BAM.PF.G\tBrookfield Asset Mgmt Inc Pref Ser 42
BAM.PF.H\tBrookfield Asset MGT Inc Pref Ser 44
BAM.PF.I\tBrookfield Asset Mgmt Inc Pref Ser 46
BAM.PF.J\tBrookfield Asset Mgmt Inc Pref Ser 48
BBD.A\tBombardier Inc Cl A Mv
BBD.B\tBombardier Inc Cl B Sv
BEK.B\tBecker Milk Company Ltd Cl.B NV
BTB.DB.G\tBtb REIT 6.0 Pct Debs
BTB.DB.H\tBtb REIT 7.00 Pct Debs
BYL.DB\tBaylin Technologies Inc 6.5 Pct Debs
CBD.U\tHempfusion Wellness Inc
CCL.A\tCcl Inc Cl A
CCL.B\tCcl Industries Inc Cl B NV
CEF.U\tCentral Fund of Canada Ltd Cl.U NV
CGX.DB.B\tCineplex Inc Debs
CHE.DB.C\tChemtrade Logistics Income Fund 5.0 Debs
CHE.DB.D\tChemtrade Logistics Inc Fd 4.75 Pct Debs
CHE.DB.E\tChemtrade Logistics If 6.50 Pct Debs
CHE.DB.F\tChemtrade Logistics If 8.50 Pct Debs
CHR.DB.A\tChorus Aviation Inc 5.75 Pct Debs
CHR.DB.B\tChorus Aviation Inc 6.00 Pct Debs
CJR.B\tCorus Entertainment Inc Cl.B NV
CJT.DB.D\tCargojet Inc 5.75 Pct Debs
CJT.DB.E\tCargojet Inc 5.75 Pct Debs
CJT.DB.F\tCargojet Inc 5.25 Pct Debs
CKI.DB\tClarke Inc 6.25 Pct Debs
CSU.DB\tConstellation Software Inc Debs Ser 1
CSW.A\tCorby Spirit and Wine Ltd Class A
CSW.B\tCorby Spirit and Wine Ltd Class B
CTC.A\tCanadian Tire Corporation Cl A NV
CUP.U\tCaribbean Util US
DBM.NT\tDoman Build Materials Grp 6.375 Pct Note
DHT.U\tDri Healthcare Trust USD
DII.A\tDorel Industries Inc Cl.A Mv
DII.B\tDorel Industries Inc Cl.B Sv
DIV.DB\tDiversified Royalty Corp 5.25 Pct Debs
DRT.DB\tDirtt Environmental Solns Ltd 6 Pct Debs
ECN.DB\tEcn Capital Corp 6.0 Pct Debs
EFN.DB.B\tElement Fleet Management 4.25 Pct Debs
EIF.DB.H\tExchange Income Corp 5.25 Pct Debs
EIF.DB.I\tExchange Income Corp 5.25 Pct Debs
EIF.DB.J\tExchange Income Corp 5.35 Pct Debs
EIF.DB.K\tExchange Income Corp 5.75 Pct Debs
EMP.A\tEmpire Company Limited
ENB.PF.A\tEnbridge Inc Pref Ser 9
ENB.PF.C\tEnbridge Inc Pref Ser 11
ENB.PF.E\tEnbridge Inc Pref Ser 13
ENB.PF.G\tEnbridge Inc Pref Ser 15
ENB.PF.I\tEnbridge Inc Pref Ser 17
ENB.PF.K\tEnbridge Inc Pref Series 19
ENB.PF.U\tEnbridge Inc Pref Ser L
ENB.PF.V\tEnbridge Inc Pref Ser 5 USD
EXE.DB.C\tExtendicare Inc 5 Pct Debs
FDE.A\tFirst Trust Alphadex Emg Mkt Div CAD AC
FFH.U\tFairfax Financial Holdings Limited USD
FIH.U\tFairfax India Holdings Corporation USD
FSZ.DB\tFiera Capital Corp 5.0 Pct Debs
FSZ.DB.A\tFiera Capital Corp 5.60 Pct Debs
FVI.DB.U\tFortuna Silver Mines Inc 4.65 Pct Debs
GCG.A\tGuardian Capital Group Ltd Cl.A NV
GCM.NT.U\tGran Colombia Gold 5.0 Pct Sil Notes
GIB.A\tCGI Group Inc Cl.A Sv
HMM.A\tHammond Manufacturing Co. Ltd Cl A. Sv
HOM.DB.U\tBsr REIT 5.0 Pct Debs USD
HOM.U\tBsr Real Estate Investment Trust
HOT.DB.U\tAmerican Hotel Inc Prop REIT 5 Pct Debs
HOT.U\tAmerican Hotel Income Properties REIT US
HPS.A\tHammond Power Solutions Inc Cl A. Sv
IBG.DB.E\tIbi Group Inc. 6.50% Listed Senior
INE.DB.B\tInnergex Renewable Energy 4.75 Pct Debs
INE.DB.C\tInnergex Renewable Energy 4.65 Pct Debs
IVQ.DB.U\tInvesque Inc 5.00 Pct Debs
IVQ.DB.V\tInvesque Inc 6.00 Pct Debs USD
IVQ.U\tInvesque Inc
LAS.A\tLassonde Industries Inc Cl A Sv
LGT.A\tLogistec Corporation Cl.A Mv
LGT.B\tLogistec Corporation Cl.B Sv
MDP.DB\tMedexus Pharmaceuticals Inc 6.0 Pct Debs
MHC.U\tFlagship Communities Real Estate Investm
MNS.U\tRoyal CDN Mint CDN Svr Reserves Etr USD
MNT.U\tRoyal Canadian Mint CDN Gld Reserves USD
MPC.C\tMadison Pacific Properties Inc Cl.C NV
MRG.DB.A\tMorguard Na REIT 4.50 Pct Debs
MRT.DB\tMorguard REIT 4.50 Pct Debs
MTL.DB\tMullen Group Ltd 5.75 Pct Debs
NAC.U\tNextpoint Acquisition Corp USD
NOA.DB.A\tNa Construction Grp Ltd 500% Conv. Unsec. Sub DE
NOA.DB.B\tNorth American Construc Grp 5.5 Pct Debs
NPF.U\tNextpoint Financial Inc
NWH.DB.F\tNorthwest Healthcare Prop 5.25 Pct Debs
NWH.DB.G\tNorthwest Healthcare Prop REIT 5.50 Debs
PBH.DB.F\tPremium Brands Hld Corp 4.60 Pct Debs
PBH.DB.G\tPremium Brands Holdings 4.65 Pct Debs
PBH.DB.H\tPremium Brands Holdings 4.20 Pct Debs
PBI.B\tPurpose Best Ideas Fund Non Hdg
PIC.A\tPremium Income A
PLC.DB\tPark Lawn Corporation 5.75 Pct Debs
PLZ.DB.E\tPlaza Retail REIT 5.10 Pct Debs
PNC.A\tPostmedia Network Canada Corp Cl A
PNC.B\tPostmedia Network Canada Corp Cl B
PPL.PF.A\tPembina Pipeline Corp Pref Ser 21
PPL.PF.C\tPembina Pipeline Corp Pref Series 23
PPL.PF.E\tPembina Pipeline Corp Pref Series 25
PZW.F\tInvesco FTSE RAFI Glb Small Mid Hedge
QBR.A\tQuebecor Inc Cl.A Mv
QBR.B\tQuebecor Inc Cl.B Sv
RAY.A\tStingray Digital Group Inc Sv
RAY.B\tStingray Digital Group Inc Variable Sv
RCI.A\tRogers Communications Inc Cl.A Mv
RCI.B\tRogers Communications Inc Cl.B NV
RSI.DB.E\tRogers Sugar Inc 5Pct Debs
RSI.DB.F\tRogers Sugar Inc 4.75 Pct Debs
RWX.B\tCI First Asset MSCI Intl Low Risk Wghtd Unhgd Et
SGR.R\tSlate Grocery REIT Sub Receipts
SGR.U\tSlate Grocery REIT USD
SGY.DB\tSurge Energy Inc 5.75 Pct Debs
SGY.DB.A\tSurge Energy Inc  6.75 Pct Debs
SJR.B\tShaw Communications Inc Cl.B NV
SOT.DB\tSlate Office REIT 5.25 Pct Debs
TCL.A\tTranscontinental Inc Cl A Sv
TCL.B\tTranscontinental Inc Cl B Mv
TCN.DB.U\tTricon Capital Group 5.75 Pct Debs USD
TPX.A\tMolson Coors Canada Inc Cl.A Lv
TPX.B\tMolson Coors Canada Inc Cl.B NV
TVA.B\tTva Group Inc Cl.B NV
TWM.DB\tTidewater Midstream Infras 5.5 Pct Debs
TXF.B\tCI First Asset Tech Giants Cov Call Unheg
URB.A\tUrbana Corporation A NV
VMH.U\tVm Hotel Acquisition Corp Cls A USD
VWE.U\tVintage Wine Estates Inc USD
WCM.A\tWilmington Capital Mgmt Inc Cl A NV
WIR.U\tWpt Industrial REIT USD
WJX.DB\tWajax Corporation 6.00 Pct Debs
XMF.A\tM Split Corp Capital Shares 2014
XXM.B\tCI First Asset Morningstr US Value Idx Unhdgd Et
YXM.B\tCI First Asset Morningstar US Momentum Unhdgd Et
BASE.B\tEvolve Glob Matls Mining Enh Yld Unhgd
BBTV.DB\tBbtv Holdings Inc 7 Pct Debs
BITC.U\tBitcoin Trust USD
CALL.B\tEvolve US Banks Enhanced Yield Unheg
CARS.U\tEvolve Automobile Innovation Idx Fd USD
CMAG.U\tCI Munro Alt Global Growth Fund USD
CRWN.DB\tCrown Capital Partners Inc 6.0 Pct Debs
CWEB.WR\tCharlottes Web Holdings Inc Wr
CWEB.WS\tCharlottes Web Holdings Inc Ws
CYBR.U\tEvolve Cyber Security Index Uh Fund USD
FLOT.U\tPurpose Floating Rate Income Fund USD
FOOD.DB\tGoodfood Market Corp 5.75 Pct Debs
HFPC.U\tHelios Fairfax Partners Corporation
HMMJ.U\tHorizons Marijuana Life Sciences Idx USD
INCR.U\tIntercure Ltd
KILO.B\tPurpose Gold Bullion Fund Non Hedged
KILO.U\tPurpose Gold Bullion Fund Non Hedged USD
LIFE.B\tEvolve Global Healthcare Enhance Yld Unheg
NVEI.U\tNuvei Corporation USD
PHYS.U\tSprott Physical Gold Trust USD
PMIF.U\tPimco Monthly Income Fund
PSLV.U\tSprott Physical Silver Trust USD
QBTC.U\tThe Bitcoin Fund
QETH.U\tEther Fund [The]
RUSB.U\tRBC Short Term US Corp Bond USD
SPPP.U\tSprott Physical Platinum Palladium USD
SZLS.WS\tStagezero Life Sciences Ltd Warrants
TECK.A\tTeck Resources Limited Cl A
TECK.B\tTeck Resources Limited Cl B
TFPM.U\tTriple Flag Precious Metals Corp
TGOD.WA\tThe Green Organic Dutchman Hlds Ltd WA
TGOD.WB\tThe Green Organic Dutchman Hlds Ltd Wb
TGOD.WR\tGreen Organic Dutchman Holdings Ltd WT
TGOD.WS\tThe Green Organic Dutchman Hlds Ltd Ws
WILD.DB\tWildbrain Ltd 5.875 Pct Debs
AD.UN\tAlaris Equity Partners Income Trust
AGR.UN\tSustainable Agriculture Wellness Div Fnd
AP.UN\tAllied Properties Real Estate Inv Trust
APR.UN\tAutomotive Properties REIT
AW.UN\tA&W Revenue Royalties Income Fund
AX.UN\tArtis Real Estate Investment Trust Units
BBU.UN\tBrookfield Business Partners LP
BEI.UN\tBoardwalk Real Estate Investment Trust
BEP.UN\tBrookfield Renewable Partners LP
BGI.UN\tBrookfield Glbl Infras Sec Inc Fd
BIP.UN\tBrookfield Infra Partners LP Units
BL.UN\tGlobal Innovation Dividend Fund
BLB.UN\tBloom Select Income Fund
BPF.UN\tBoston Pizza Royalties Income Fund
BPY.UN\tBrookfield Property Partners LP
BSO.UN\tBrookfield Select Opportunities Inc Fund
BTB.UN\tBtb REIT Units
BUA.UN\tBloom US Income and Growth Fund
CAR.UN\tCDN Apartment Un
CDD.UN\tCore Canadian Dividend Trust
CHE.UN\tChemtrade Logistics Income Fund
CHP.UN\tChoice Properties REIT
CIQ.UN\tCanadian High Income Equity Fund
CLP.UN\tInternational Clean Power Dividend Fund
CRR.UN\tCrombie Real Estate Investment Trust
CRT.UN\tCT Real Estate Investment Trust
CSH.UN\tChartwell Retirement Residences
CTF.UN\tCitadel Income Fund
CUF.UN\tCominar R E Un
D.UN\tDream Office REIT
DHT.UN\tDri Healthcare Trust
DIR.UN\tDream Industrial REIT
EIT.UN\tCanoe Eit Income Fund Units
ENI.UN\tEnergy Income Fund
ERE.UN\tEuropean Residential Real Estate Invs. Trust
FCR.UN\tFirst Capital REIT Units
FFI.UN\tFlaherty & Crumrine Fixed Income Fund
GDG.UN\tGlobal Dividend Growers Income Fund
GEC.UN\tGlobal Real Estate & E-Commerce Dividend
GRT.UN\tGranite Real Estate Investment Trust
HBL.UN\tBrand Leaders Income Fund
HOM.UN\tBsr Real Estate Investment Trust
HOT.UN\tAmerican Hotel Income Properties REIT LP
HR.UN\tH&R Real Estate Inv Trust
HRR.UN\tAustralian REIT Income Fund
IIP.UN\tInterrent Real Estate Investment Trust
INC.UN\tIncome Fin Un
INF.UN\tSustainable Infrastructure Div Fund
INO.UN\tInovalis REIT
JFS.UN\tJft Strategies Fund
KEG.UN\tKeg Royalties Income Fund
KMP.UN\tKillam Apartment REIT
MDC.UN\tDigital Consumer Dividend Fund
MDS.UN\tHealthcare Special Opp Fund
MI.UN\tMinto Apartment REIT
MID.UN\tMint Income Fund
MKZ.UN\tMackenzie Mstr Un
MMP.UN\tPrecious Metals and Mining Trust
MPCT.UN\tDream Impact Trust Units
MR.UN\tMelcor REIT
MRG.UN\tMorguard Na Residential REIT Units
MRT.UN\tMorguard Un
NHF.UN\tNorthview CDN High Yld Residential Fund
NIF.UN\tNoranda Income Fund
NWH.UN\tNorthwest Healthcare Prop REIT
NXR.UN\tNexus Real Estate Investment Trust
PBY.UN\tCanso Credit Income Fund Units
PGI.UN\tPimco Global Inc Opportunities Fund
PLZ.UN\tPlaza Retail REIT
PMB.UN\tPicton Mahoney Tactical Income Fund
PRV.UN\tPro Real Estate Investment Trust
PTI.UN\tPimco Tactical Income Fund
PTO.UN\tPimco Tactical Income Opportunites Fund
QETH.UN\tThe Ether Fund
QSP.UN\tRestaurant Brands Intl Ltd Partnership
RA.UN\tMiddlefield Global Real Asset Fund
RAV.UN\tRavensource Fund
RBN.UN\tBlue Ribbon Income Fund
RCO.UN\tMiddlefield Can Global REIT Income Fund
REI.UN\tRiocan Real Est Un
RIB.UN\tRidgewood CAD Invest Grade Bond Fund
RPI.UN\tRichards Packaging Income Fund
SGR.UN\tSlate Grocery REIT
SIH.UN\tSustainable Innovation & Health Dividend
SMU.UN\tSummit Industrial Income REIT
SOT.UN\tSlate Office REIT
SRU.UN\tSmartcentres Real Estate Investment Trust
SRV.UN\tSir Royalty Income Fund
SSF.UN\tSymphony Floating Rate Sr Loan Fd
TCT.UN\tTop 10 Canadian Financial Trust
TNT.UN\tTrue North Commercial REIT
TXT.UN\tTop 10 Split Trust
U.UN\tSprott Physical Uranium Trust
USF.UN\tUS Financials Income Fund
UTE.UN\tCanadian Utilities Telecom Inc Fd
WIR.UN\tWpt Industrial REIT Units
ACZ\tMiddlefield American Core Dividend ETF
ARB\tAccelerate Arbitrage Fund ETF
ATSX\tAccelerate Enhanced CDN Bm Alt Fund ETF
AUGB.F\tFirst Trst CBOE Vest US Eqty Buffer ETF
BASE\tEvolve Glob Matls Mining Enh Yld Idx ETF
BBIG\tHorizons Global Bbig Technology ETF Clas
BBIG.U\tHorizons Global Bbig Tech ETF USD
BDEQ\tBlack Diamond Global Equity Fund ETF
BDIV\tBrompton Global Dividend Growth ETF
BDOP\tBlack Diamond Distressed Opport Fund ETF
BESG\tInvesco ESG CDN Core Plus Bond ETF
BFIN\tBrompton Na Financials Dividend ETF
BGC\tBristol Gate Concentrated CDN Eqty ETF
BGU\tBristol Gate Concentrated US Eqty ETF
BGU.U\tBristol Gate Conc US Eqty ETF USD
BITC\tNinepoint Bitcoin ETF
BITI\tBetapro Inverse Bitcoin ETF
BITI.U\tBetapro Inverse Bitcoin ETF USD
BKL.C\tInvesco Senior Loan Index ETF
BKL.F\tInvesco Senior Loan Index ETF
BKL.U\tInvesco Senior Loan Index USD ETF
BLCK\tFirst Trust Indxx Innov Trans Proc ETF
BLOV\tBrompton Na Low Volatility Dividend ETF
BNC\tPurpose CDN Financial Income Fund ETF
BND\tPurpose Tactical Inv Grade Bond ETF
BPRF\tBf and Crumrine Invest Grade Pref ETF
BPRF.U\tBf and Crumrine Invgrade Pref ETF USD
BREA\tBrompton Global Real Assets Dividend ETF
BSKT\tManulife Smart Core Bond ETF
BTCC\tPurpose Bitcoin ETF Currency Hgd
BTCC.B\tPurpose Bitcoin ETF [Cad ETF Non-Currenc
BTCC.U\tPurpose Bitcoin ETF [Usd ETF Non-Currenc
BTCQ\t3iQ Coinshares Bitcoin ETF
BTCQ.U\t3iQ Coinshares Bitcoin ETF USD
BTCX.B\tCI Galaxy Bitcoin ETF [Cad Unhedged Unit
BTCX.U\tCI Galaxy Bitcoin ETF [Usd Unhedged Unit
BXF\tCI First Asset 1 To 5 Yr Lad Gov Stp Bd ETF
CACB\tCIBC Active Invst Grade Corp Bond ETF
CAFR\tCIBC Act Invst Grade Float Rate Bond ETF
CAGG\tCI Yield Enh CDN Agrt Bond ETF
CAGS\tCI Yield Enh CDN ST Agt Bond ETF
CALL\tEvolve US Banks Enhanced Yield ETF
CALL.U\tEvolve US Banks Enhanced Yld Fd ETF USD
CARS\tEvolve Automobile Innovation Idx Hgd ETF
CARS.B\tEvolve Automobile Innovation Idx Uh ETF
CBH\tIshares 1-10 Yr Laddered Corp Bond ETF
CBO\tIshares 1-5Yr Laddered Corp Bond ETF
CCBI\tCIBC Canadian Bond Index ETF
CCEI\tCIBC Canadian Equity Index ETF
CCNS\tCIBC Conservative Fixed Income Pool ETF
CCOR\tCI Doubleline Cor Plus Fxd Inc US HD ETF
CCRE\tCIBC Core Fixed Income Pool ETF
CDIV\tManulife Smart Dividend ETF
CDLB\tCI Doubleline Total Return Bnd US HD ETF
CDLB.B\tCI Doubleline Total Return Bnd US Uh ETF
CDZ\tIshares S&P TSX CDN Dividend ETF
CEW\tIshares Equal Weight Banc Lifeco ETF
CFLX\tCIBC Flexible Yield ETF Hedged
CGAA\tCI First Asset Glb Asset Allocation ETF
CGL\tIshares Gold Bullion ETF Hdg
CGL.C\tIshares Gold Bullion ETF Non Hdg
CGLO\tCIBC Global Growth ETF
CGR\tIshares Global Real Estate ETF
CGRA\tCI Global Real Asset Private Pool ETF
CGRE\tCI Global REIT Private Pool ETF
CGXF\tCI First Asset Gold Giants Cvr Call ETF
CHB\tIshares US HY Fixed Income Index ETF
CHNA.B\tCI Icbccs SP China 500 Index ETF
CHPS\tHorizons Global Semiconductor Index ETF
CHPS.U\tHorizons Global Semiconductr Idx ETF USD
CIBR\tFirst Trust Nasdaq Cybersecurity ETF
CIC\tCI First Asset Canbanc Income Class ETF
CIEI\tCIBC International Equity Index ETF
CIF\tIshares Global Infrastructure Index ETF
CINC\tCI Doubleline Income US Hdg ETF
CINF\tCI Global Infrastructure Pvt Pool ETF
CINT\tCIBC International Equity ETF
CLF\tIshares 1-5 Yr Ladder Govt Bond ETF
CLG\tIshares 1-10 Yr Ladder Govt Bond ETF
CLML\tCI Global Climate Leaders Fund ETF
CMAG\tCI Munro Alt Global Growth ETF
CMAR\tCI Marret Alt Absolute Return Bnd ETF
CMAR.U\tCI Marret Alt Absolute Rtrn Bnd ETF USD
CMCE\tCIBC Multifactor Canadian Equity ETF
CMEY\tCI Marret Alternative Enhanced Yield ETF
CMGG\tCI Munro Global Gwth Equity Fund ETF CAD
CMR\tIshares Premium Money Market ETF
CMUE\tCIBC Multifactor US Equity ETF
CMUE.F\tCIBC Multifactor US Equity ETF Hedged
CNAO\tCI Alternative Na Opps Fund ETF
CNAO.U\tCI Alternative Na Opps Fund ETF USD
COMM\tBMO Global Communications Index ETF
COW\tIshares Global Agri Index ETF
CPD\tIshares S&P TSX CDN Pref ETF
CPLS\tCIBC Core Plus Fixed Income Pool ETF
CRED\tCI Lawrence Park Alt Invest Grd Crdt ETF
CRED.U\tCI Lawrence Park Alt Inv Grd Crt ETF USD
CSAV\tCI First Asset High Interest Savings ETF
CSD\tIshares Short Dur HI Inc ETF CAD Hgd
CSY\tCI First Asset Core Can Equity Inc Class ETF
CUD\tIshares S&P US Div Growers ETF
CUEI\tCIBC US Equity Index ETF
CVD\tIshares Convertible Bond Index ETF
CWW\tIshares S&P Global Water ETF
CXF\tCI First Asset CDN Convert Bond ETF
CYBR\tEvolve Cyber Security Index Hgd ETF
CYBR.B\tEvolve Cyber Security Index Uh ETF
CYH\tIshares Global Monthly Dividend ETF
DANC\tDesjardins Lng Shrt Eqty Mkt Ntrl ETF
DATA\tEvolve Cloud Computing Index Fund Hg ETF
DATA.B\tEvolve Cloud Computing Indx Fund Uhg ETF
DCC\tDesjardins 1To5 Yr Lad CDN Corp Bd ETF
DCG\tDesjardins 1To5 Yr Lad CDN Govt Bd ETF
DCP\tDesjardins CDN Pref Share ETF
DCS\tDesjardins CDN Short Term Bd ETF
DCU\tDesjardins CDN Universe Bond Index ETF
DFC\tDesjardins Cda Multifactor Ctrl Vol ETF
DFD\tDesjardins Dev Xus Xcda Mltifact Vol ETF
DFE\tDesjardins EM Multifactor-Controlled Vol ETF
DFU\tDesjardins USA Multifactor Ctrl Vol ETF
DGR\tCI Wisdomtree US Quality Div Growth Index ETF
DGR.B\tCI Wisdomtree US Quality Div Growth Index ETF
DGRC\tCI Wisdomtree CDN Qlty Div Gwth Idx ETF
DISC\tBMO Glb Consumer Disc Hgd To CAD ETF
DIVS\tEvolve Active CDN Pref Share ETF
DLR\tHorizons US Dollar Currency ETF
DLR.U\tHorizons US Dollar Currency ETF USD
DQD\tCI Wisdomtree Y.S. Qlty Divd Gwth Var Hgd ETF
DQI\tCI Wisdomtree Intl Qlty Div Gwth Var Hgd ETF
DRFC\tDesjardins RI Cda Multi Low Co2 ETF
DRFD\tDesjardins RI Dev Ex USA Ex Cda Co2 ETF
DRFE\tDesjardins Emerging Mkts Low Co2 ETF
DRFG\tDesjardins Gbl Fossil Fuel Res Free ETF
DRFU\tDesjardins RI USA Multi Low Co2 ETF
DRMC\tDesjardins RI Canada-Low Co2 Index ETF
DRMD\tDesjardins RI Dev Exusa Exca Low Co2 ETF
DRME\tDesjardins RI Emrgng Mkt Low Co2 Idx ETF
DRMU\tDesjardins RI USA Low Co2 Index ETF
DXB\tDynamic Ishares Act Tactical Bond ETF
DXC\tDyn Ishares Active CDN Div ETF
DXEM\tDynamic Active Emerging Markets ETF
DXET\tDynamic Active Energy Evolution ETF
DXF\tDynamic Ishares Act Global Fin Ser ETF
DXG\tDyn Ishares Active Global Div ETF
DXIF\tDynamic Active International ETF
DXN\tDynamic Active Global Infrastructure ETF
DXO\tDyn Ishares Act Crossover Bond ETF
DXP\tDyn Ishares Active Pref Shares ETF
DXR\tDynamic Active Retirement Income+ ETF
DXU\tDyn Ishares Active US Div ETF
DXV\tDyn Ishares Act Inv Grd Flot Rt ETF
DXW\tDynamic Active Intl Dividend ETF
DXZ\tDynamic Ishares Acitve US Mid Cap ETF
EARN\tEvolve Active Global Fixed Income ETF
EBIT\tBitcoin ETF
EBIT.U\tBitcoin ETF USD
EDGE\tEvolve Innovation Index ETF
EDGE.U\tEvolve Innovation Index Fund Uhg ETF USD
EDGF\tBrompton European Div Growth ETF
EGIF\tExemplar Growth and Income Fund ETF
EHE\tCI Wisdomtree Europe Hedged Equity Index ETF
EHE.B\tCI Wisdomtree Europe Hedged Equity Index ETF
ELV\tPowershares S&P Emg Mkts Low Vol ETF
EMV.B\tCI Wisdomtree Emerging Mkt Divd Index ETF
EQL\tInvesco S&P 500 Eql Weight Idx ETF
EQL.F\tInvesco S&P 500 Eql Weight Idx ETF Hgd
EQL.U\tInvesco S&P 500 Eql Weight Idx ETF USD
ESG\tInvesco S&P 500 ESG Index ETF
ESG.F\tInvesco S&P 500 ESG Index ETF Hedged
ESGA\tBMO MSCI Canada ESG Leaders Index ETF
ESGB\tBMO ESG Corporate Bond Index ETF
ESGC\tInvesco SP TSX Composite ESG Index ETF
ESGE\tBMO MSCI EAFE ESG Leaders Index ETF
ESGF\tBMO ESG US Corp Bnd Hdgd To CAD Idx ETF
ESGG\tBMO MSCI Global ESG Leaders Index ETF
ESGY\tBMO MSCI USA ESG Leaders Index ETF
ESGY.F\tBMO MSCI USA ESG Leaders Index ETF
ETHH\tPurpose Ether CAD ETF
ETHH.B\tPurpose Ether Non-Cur Hedg ETF
ETHH.U\tPurpose Ether ETF USD
ETHI\tHorizons Global Sustain Leaders Idx ETF
ETHQ\t3iQ Coinshares Ether ETF
ETHQ.U\t3iQ Coinshares Ether ETF USD
ETHR\tEther Unhedg ETF
ETHR.U\tEther ETF USD
ETHX.B\tCI Galaxy Unhedg Ethereum ETF
ETHX.U\tCI Galaxy Ethereum ETF USD
ETP\tFirst Trust Global Risk Managed Inc ETF
EUR\tFirst Trust Alphadex Euro Div ETF
FAI\tCI First Asset Utility & Infra ETF
FAO\tCI First Asset Active Credit ETF
FAO.U\tCI Fa Active Credit ETF USD
FBGO\tFranklin Brandywine Glbl Sust Act ETF
FBT\tFirst Trust NYSE Arca Biotechnology ETF
FCCB\tFidelity Systematic CDN Bond Index ETF
FCCD\tFidelity CDN High Div Index ETF
FCCL\tFidelity Canadian Low Vol Index ETF
FCCM\tFidelity Canadian Momentum Index ETF
FCCQ\tFidelity Canadian High Quality Index ETF
FCCV\tFidelity Canadian Value Index ETF
FCGB\tFidelity Global Core Plus Bond ETF
FCGI\tFidelity Global Monthly High Income ETF
FCHH\tFidelity Systematic US HI Yld Bd Cn ETF
FCHY\tFidelity Systematic US High Yld Bond ETF
FCID\tFidelity Intl High Dividend Index ETF
FCIG\tFidelity Global Investment Grade Bnd ETF
FCII\tFranklin Clearbridge Sust Glbl Act ETF
FCIL\tFidelity Intl Low Vol Index ETF
FCIM\tFidelity International Momentum Idx ETF
FCIQ\tFidelity Intl High Quality Index ETF
FCIV\tFidelity International Value Index ETF
FCLH\tFidelity US Low Vol Cur Ntrl Index ETF
FCMH\tFidelity US Momentum Cur Neut Index ETF
FCMI\tFidelity CDN Monthly High Income ETF
FCMO\tFidelity US Momentum Index ETF
FCQH\tFidelity US High Qlty Cur Ntrl Index ETF
FCRR\tFidelity US Div For Rising Rates Idx ETF
FCSB\tFidelity Canadian Short Term Corp Bd ETF
FCSI\tFranklin Clearbridge Sust Intl Act ETF
FCUD\tFidelity US High Div Index ETF
FCUH\tFidelity US High Div Cur Neu Idx ETF
FCUL\tFidelity US Low Vol Index ETF
FCUQ\tFidelity US High Quality Index ETF
FCUV\tFidelity US Value Index ETF
FCVH\tFidelity US Value Currency Neut Idx ETF
FDE\tFirst Trust Alphadex Emg Mkt Div ETF CAD
FDL\tFirst Trust Morningstar Div Ldrs ETF Hgd
FDN\tFirst Trust Dow Jones Internet ETF
FDN.F\tFirst Trust Dow Jones Internet ETF Hgd
FDV\tCI First Asset Active CDN Divd ETF
FEBB.F\tFirst Trust CBOE Vest US Eqty ETF Feb
FGB\tCI First Asset Shrt Term Govt Bond Indx Cl ETF
FGGE\tFranklin Global Growth Active ETF
FGO\tCI First Asset Enhanced Govt Bond ETF
FGO.U\tCI First Asset Enhanced Govt Bond ETF USD
FHG\tFirst Trust US Industrials ETF
FHG.F\tFirst Trust Ad US Industrials ETF
FHH\tFirst Trust US Health Care ETF
FHH.F\tFirst Trust Ad US Health Care ETF
FHI\tCI First Asset Hlth Care Giants Cov Call ETF
FHI.B\tCI First Asset Hlth Care Giants Cov Call ETF
FHQ\tFirst Trust US Technology ETF
FHQ.F\tFirst Trust Ad US Technology ETF
FIE\tIshares CDN Fin Mthly Income ETF
FIG\tCI First Asset Investment Grade Bond ETF
FIG.U\tCI First Asset Investment Grade Bond ETF USD
FINO\tFranklin Innovation Active ETF
FINT\tFirst Trust Intl Capital Strength ETF
FIVE\tEvolve SP 500 Cleanbeta Fund Hg ETF
FLBA\tFranklin Liberty Core Balanced ETF
FLCI\tFranklin Liberty CDN Invest Grd Corp ETF
FLCP\tFranklin Liberty Core Plus Bond ETF
FLDM\tFranklin Libertyqt Intl Eqt Index ETF
FLEM\tFranklin Libertyqt Emerging Mkts Idx ETF
FLGA\tFranklin Liberty Global Agg Bond ETF
FLGD\tFranklin Libertyqt Glb Dividend Idx ETF
FLI\tCI First Asset US Cda Lifeco Income ETF
FLOT\tPurpose Floating Rate Income Fund ETF
FLOT.B\tPurpose Floating Rate Income Fund ETF NH
FLRM\tFranklin Liberty Risk Mngd CDN Eqt ETF
FLSD\tFranklin Liberty Short Duration Bond ETF
FLUS\tFranklin Libertyqt US Eqt Index ETF
FOUR\tHorizons Industry 4.0 Index ETF
FPR\tCI First Asset Pref Share ETF
FQC\tCI First Asset MSCI Can Quality Index Class ETF
FSB\tCI First Asset Enhanced Sh Dur Bond ETF
FSB.U\tCI First Asset Enhanced Sh Dur Bond ETF USD
FSF\tCI First Asset Global Financial Sector ETF
FSL\tFirst Trust Senior Loan ETF
FSL.A\tFirst Trust Senior Loan ETF Adv Cls
FST\tFirst Trust CDN Capital Strength ETF
FST.A\tFirst Trust CDN Capital Strength ETF AC
FTB\tFirst Trust Tactical Bond Index ETF
FUD\tFirst Trust Alphadex US Div ETF CAD Hdg
FUD.A\tFirst Trust Value Line Div Idx ETF AC
FXM\tCI First Asset Morningstar Cda Value ETF
GBAL\tIshares ESG Balanced ETF
GCBD\tGuardian Canadian Bond ETF
GCNS\tIshares ESG Conservative Balanced ETF
GDEP\tGuardian Directed Equity Path ETF
GDEP.B\tGuardian Directed Equity Path ETF Unhdg
GDPY\tGuardian Directed Premium Yield ETF
GDPY.B\tGuardian Directed Premium Yield ETF Uh
GEQT\tIshares ESG Equity ETF
GGAC\tGuardian Fundmntl All Country Equity ETF
GGEM\tGuardian Fundmntl Emrgng Mkts Equity ETF
GGRO\tIshares ESG Growth ETF
GIGR\tGuardian I3 Global REIT Hedg ETF
GIGR.B\tGuardian I3 Global REIT Unhedg ETF
GIQG\tGuardian I3 Global Quality Growth ETF
GIQG.B\tGuardian I3 Global Quality Growth ETF
GIQU\tGuardian I3 US Quality Growth Hedg ETF
GIQU.B\tGuardian I3 US Quality Growth Unhedg ETF
HAB\tHorizons Active Corporate Bond ETF
HAC\tHorizons Seasonal Rotation ETF
HAD\tHorizons Active CDN Bond ETF
HAF\tHorizons Active Global Fixed Income ETF
HAL\tHorizons Active CDN Dividend ETF
HARB\tHorizons Tactical Absolute Rtrn Bnd ETF
HARB.J\tHorizons Tactical Abslt Rtn Bnd Div ETF
HARC\tHorizons Abs Return Global Currency ETF
HAZ\tHorizons Active Global Dividend ETF
HBA\tHamilton Australian Banks Equal-Weight ETF
HBAL\tHorizons Balanced Tri ETF
HBB\tHorizons CDN Select Universe Bond ETF
HBD\tBetapro Gold Bullion 2X Daily Bear ETF
HBF\tHarvest Brand Leaders Plus Income ETF
HBF.B\tHarvest Brand Leaders Plus Inc ETF Unh
HBF.U\tHarvest Brand Leaders Plus Income ETF USD
HBGD\tHorizons Big Data Hardware Idx ETF
HBGD.U\tHorizons Big Data Hardware Idx ETF USD
HBIT\tBetapro Bitcoin ETF
HBIT.U\tBetapro Bitcoin ETF USD
HBLK\tBlockchain Technologies ETF
HBU\tBetapro Gold Bullion 2X Daily Bull ETF
HCA\tHamilton Canadian Bank Mean Reversion ETF
HCAL\tHamilton Canadian Bank 1.25X Lvrg ETF
HCLN\tHarvest Clean Energy ETF
HCON\tHorizons Conservative Tri ETF
HCRE\tHorizons Eql Wght Can REIT Index ETF
HDGE\tAccelerate Absolute Return Hdg Fund ETF
HDIV\tHamilton Enhanced Multi-Sector Covered Call ETF
HEA\tHorizons Enhd Income US Equity ETF
HEA.U\tHorizons Enhd Income US Equity USD ETF
HED\tBetapro S&P TSX Cap Engy 2X Dly Bear ETF
HEE\tHorizons Enhanced Income Energy ETF
HEF\tHorizons Enhanced Income Fin ETF
HEJ\tHorizons Enhd Inc Intl Equity ETF
HEMB\tHorizons Active Emerging Mkts Bond ETF
HEP\tHorizons Enhanced Income Gold Prod ETF
HERO\tEvolve E Gaming Index ETF
HEU\tBetapro S&P TSX Cap Engy 2X Dly Bull ETF
HEWB\tHorizons Eql Wght Can Banks Index ETF
HEX\tHorizons Enhanced Income Equity ETF
HFD\tBetapro S&P TSX Cap Fncl 2X Dly Bear ETF
HFG\tHamilton Global Financials ETF
HFR\tHorizons Active Floating Rate Bond ETF
HFT\tHamilton Financials Innovation ETF
HFU\tBetapro S&P TSX Cap Fncl 2X Dly Bull ETF
HGD\tBetapro CDN Gold Miners 2X Dly Bear ETF
HGGB\tHorizons SP Green Bond Index ETF
HGGG\tHarvest Global Gold Giants Index ETF
HGR\tHarvest Global REIT Leaders Income ETF
HGRO\tHorizons Growth Tri ETF
HGU\tBetapro CDN Gold Miners 2X Dly Bull ETF
HGY\tHorizons Gold Yield ETF
HHF\tHorizons Morningstar Hdg Fd ETF
HHL\tHarvest Healthcare Leaders Income ETF
HHL.B\tHarvest Healthcare Leaders Inc ETF Unh
HHL.U\tHarvest Healthcare Leaders Income ETF USD
HIG\tBrompton Global Healthcare Inc & Gth ETF
HIG.U\tBrompton Gbl Health Inc Growth ETF USD
HIU\tBetapro Sp500 Daily Inverse ETF
HIX\tBetapro S&P TSX 60 Daily Inverse ETF
HLIT\tHorizons Global Lithium Producer Idx ETF
HLPR\tHorizons Laddered CDN Pref Index ETF
HMJI\tBetapro Marijuana Cos Inverse ETF
HMJU\tBetapro Marijuana Cos 2X Daily Bull ETF
HMMJ\tHorizons Marijuana Life Sciences ETF
HMP\tHorizons Active CDN Municipal Bond ETF
HND\tBetapro Nat Gas 2X Daily Bear ETF
HNU\tBetapro Nat Gas 2X Daily Bull ETF
HOD\tBetapro Crude Oil 2X Daily Bear ETF
HOG\tHorizons CDN Midstream Oil Gas ETF
HOU\tBetapro Crude Oil 2X Daily Bull ETF
HPF\tHarvest Energy Leaders Plus Income ETF
HPF.U\tHarvest Energy Leaders Plus Income ETF USD
HPR\tHorizons Active Pref Share ETF
HQD\tBetapro Nasdaq 100 2X Daily Bear ETF
HQD.U\tBetapro Nasdaq 100 2X Daily Bear ETF USD
HQU\tBetapro Nasdaq 100 2X Daily Bull ETF
HRAA\tHorizons Resolve Adptv Asset Alloc ETF
HSAV\tHorizons Cash Maximizer ETF
HSD\tBetapro Sp500 2X Daily Bear ETF
HSH\tHorizons Sp500 CAD Hedged Index ETF
HSL\tHorizons Active Float Rate Sen Loan ETF
HSU\tBetapro Sp500 2X Daily Bull ETF
HSUV.U\tHorizons USD Cash Maximizer ETF USD
HTA\tHarvest Tech Achievers Growth & Income ETF
HTA.B\tHarvest Tech Achievers Grwth Inc ETF Unh
HTA.U\tHarvest Tech Achievers Growth & Income ETF USD
HTB\tHorizons US 7 To 10 Yr Treasury Bond ETF
HTB.U\tHorizons US 7 To 10 Yr Treas Bd ETF USD
HUBL\tHarvest US Bank Leaders Income ETF
HUBL.U\tHarvest US Bank Leaders Income ETF USD
HUC\tHorizons Crude Oil ETF
HUF\tHorizons Active US Float Rate Bd ETF CAD
HUF.U\tHorizons Active US Floating Rate Bd ETF
HUG\tHorizons Gold ETF
HUL\tHarvest US Equity Plus Income ETF
HUL.U\tHarvest US Equity Plus Income ETF USD
HULC\tHorizons US Large Cap Index ETF
HULC.U\tHorizons US Large Cap Index ETF USD
HUM.U\tHamilton US Mid Small Cap Fincls ETF USD
HUN\tHorizons Natural Gas ETF
HURA\tHorizons Global Uranium Index ETF
HUTL\tHarvest Eql Wght Glb Util Income ETF
HUV\tBetapro Sp500 VIX ST Ftrs ETF
HUZ\tHorizons Silver ETF
HWF\tMiddlefield Health Wellness ETF
HXCN\tHorizons SP TSX Capped Comp Index ETF
HXD\tBetapro S&P TSX 60 2X Daily Bear ETF
HXDM\tHorizons Intl Dev Mkts Equity Index ETF
HXDM.U\tHorizons Intl Dev Mkts Eqty Idx USD ETF
HXE\tHorizons S&P TSX Capped Energy Index ETF
HXEM\tHorizons Emerging Mkts Equity Index ETF
HXF\tHorizons S&P TSX Capped Fncl Index ETF
HXH\tHorizons CDN High Dividend Index ETF
HXQ\tHorizons Nasdaq 100 Index ETF
HXQ.U\tHorizons Nasdaq 100 Index ETF USD
HXS\tHorizons S&P 500 Index ETF
HXS.U\tHorizons S&P 500 Index ETF USD
HXT\tHorizons S&P Tsx60 Index ETF
HXT.U\tHorizons S&P TSX 60 Index ETF USD
HXU\tBetapro S&P TSX 60 2X Daily Bull ETF
HXX\tHorizons Euro Stoxx 50 Index ETF
HYBR\tHorizons Active Hybrd Bond Prf Share ETF
HYDR\tHorizons Global Hydrogen Index ETF
HYI\tHorizons Active High Yield Bond ETF
HZD\tBetapro Silver 2X Daily Bear ETF
HZU\tBetapro Silver 2X Daily Bull ETF
IDR\tMiddlefield REIT Indexplus ETF
IFRF\tIA Clarington Floating Rate Income ETF
IGAF\tIA Clarington Global Allocation Fund ETF
IGB\tPurpose Mngd Duration Invest Bond ETF
ILV\tInvesco SP Intl Dev Low Vol Idx ETF
ILV.F\tInvesco SP Intl Dev Low Vol ETF Hedged
INOC\tHorizons Inovestor CDN Equity Index ETF
IQD\tCI Wisdomtree Intl Qlty Divd Growth Index ETF
IQD.B\tCI Wisdomtree Intl Qlty Divd Growth Index ETF
ISIF\tIA Claringtion Strategic Income Fund ETF
JAPN\tCI Wisdomtree Japan Equity Index ETF
JAPN.B\tCI Wisdomtree Japan Equity Index ETF
LEAD\tEvolve Future Leadership ETF Hedged
LEAD.B\tEvolve Future Leadership ETF Unhedged
LIFE\tEvolve Global Healthcare Enhance Yld ETF
LIFE.U\tEvolve Global Healthcare Yld Fund ETF USD
LONG\tCI Global Longevity Economy Fund ETF
LS\tMiddlefield Healthcare Life Sciences ETF
MAYB.F\tFirst Trust CBOE Vst US Eq Bf Hg ETF May
MBAL\tMackenzie Balanced Allocation ETF
MCLC\tManulife Mltfactor CDN Large Cap Uh ETF
MCON\tMackenzie Conservative Allocation CAD ETF
MCSB\tMackenzie CDN Short Term Fixed Inc ETF
MCSM\tManulife Mulfact CDN Smid Cap Idx ETF
MDVD\tMackenzie Global Sustainable Div Idx ETF
MEE\tMackenzie Max Diverse Emg Mkts ETF
MEME.B\tManulife Multifactor Emerg Mkts Idx ETF
MEU\tMackenzie Max Diversif Dev EUR ETF
MFT\tMackenzie Floating Rate Income ETF
MGAB\tMackenzie Global Fixed Income Alloc ETF
MGB\tMackenzie Core Pls Glob Fixed Inc ETF
MGRW\tMackenzie Growth Allocation ETF
MIND\tHorizons Active Ai Global Equity ETF
MINT\tManulife Mltfactor Dev Intl Hgd ETF
MINT.B\tManulife Mltfactor Dev Intl Uh ETF
MIVG\tMackenzie Ivy Global Equity ETF
MKB\tMackenzie Core Pls CDN Fixed Income ETF
MKC\tMackenzie Max Dvrs Cda Index ETF
MPCF\tMackenzie Portfolio Completion ETF
MUB\tMackenzie Unconstrained Bond ETF
MULC\tManulife Mltfactor US Large Cap Hgd ETF
MULC.B\tManulife Mltfactor US Large Cap Uh ETF
MUMC\tManulife Mltfactor US Mid Cap Hgd ETF
MUMC.B\tManulife Mltfactor US Mid Cap Uh ETF
MUS\tMackenzie Max Dvrs US Index ETF
MUSC\tManulife Multifactor U.S. Small Cap Index ETF
MWD\tMackenzie Max Diversif World Dev ETF
MXU\tMackenzie Max Divers Wrld Dev Ex Na ETF
NALT\tNbi Liquid Alternatives ETF
NCG\tNcm Core Global ETF
NDIV\tNbi Canadian Dividend Income ETF
NFAM\tNbi Canadian Family Business ETF
NGPE\tNbi Global Private Equity ETF
NHYB\tNbi High Yield Bond ETF
NINT\tNbi Active International Equity ETF
NOVB.F\tFT CBOE Vest US Eqty Buffer November ETF
NPRF\tNbi Active Canadian Preferred Sh ETF
NREA\tNbi Global Real Assets Income ETF
NSCB\tNbi Sustainable Canadian Bond ETF
NSCC\tNbi Sustainable CDN Corporate Bond ETF
NSCE\tNbi Sustainable Canadian Equity ETF
NSGE\tNbi Sustainable Global Equity ETF
NUBF\tNbi Unconstrained Fixed Income ETF
NUSA\tNbi Active US Equity ETF
NXF\tCI First Asset Energy Giants Cov Call ETF
NXF.B\tCI First Asset Energy Giants ETF Unhedged
NXTG\tFirst Trust Indxx Nextg ETF
ONEB\tCI One North American Core Plus Bond ETF
ONEC\tAccelerate Onechoice Altnv Portfolio ETF
ONEQ\tCI One Global Equity ETF
ORBT\tHarvest Space Innovation Index ETF - Cla
ORBT.U\tHarvest Space Innovation Index ETF USD
PAYF\tPurpose Enhanced Premium Yield Fund ETF
PBD\tPurpose Total Return Bond Fund ETF
PBI\tPurpose Best Ideas Fund ETF
PCON\tPimco Managed Conservative Bond Pool ETF
PCOR\tPimco Managed Core Bond Pool ETF
PDC\tInvesco CDN Div Idx ETF
PDF\tPurpose Core Dividend Fund ETF
PDIV\tPurpose Enhanced Dividend Fund ETF
PFAE\tPicton Mahoney Fort Act Ext Alt Fund ETF
PFH.F\tInvesco HY Corp Bond Index ETF
PFIA\tPicton Mahoney Fort Income Alt Fund ETF
PFL\tPowershares 1 To 3 Yr Lad Float Rate ETF
PFLS\tPicton Mahoney Frt Lng Shrt Alt Fund ETF
PFMN\tPicton Mahoney Fort Mkt Neutral Fund ETF
PFMS\tPicton Mahoney Multi Strat Alt Fund ETF
PHE\tPurpose Tactical Hedged Equity Fund ETF
PHR\tPurpose Duration Hedged Real Estate ETF
PHW\tPurpose Intl Tactical Hedged Equity ETF
PID\tPurpose Intl Dividend Fund ETF
PIN\tPurpose Monthly Income Fund ETF
PLDI\tPimco Low Duration Monthly Inc ETF
PLV\tInvesco Low Vol Portfolio ETF
PMNT\tPimco Global Short Maturity Fund ETF
PPS\tInvesco CDN Pref Share Idx ETF
PR\tLysander Slater Pref Share Activ ETF
PRA\tPurpose Diversified Real Asset Fund ETF
PRP\tPurpose Conservative Income Fund ETF
PSA\tPurpose High Interest Savings ETF
PSB\tInvesco 1 To 5 Yrladder Inv Grd Bd ETF
PSU.U\tPurpose US Cash ETF
PSY\tPwrshr Glb Sharehldr Yield ETF
PUD\tPurpose US Dividend Fund ETF
PUD.B\tPurpose US Dividend Fund ETF NC Hedged
PXC\tInvesco FTSE RAFI CAD Idx ETF
PXG\tInvesco FTSE RAFI Global Plus ETF
PXG.U\tInvesco FTSE RAFI Global Plus ETF USD
PXS\tPwrshr FTSE RAFI US Fdamntl ETF II
PXU.F\tInvesco FTSE RAFI US Idx ETF
PYF\tPurpose Premium Yield Fund ETF
PYF.B\tPurpose Premium Yield Fund Non Hdg ETF
PYF.U\tPurpose Premium Yield Fund NH USD ETF
PZC\tPwrshr FTSE RAFI CDN Sml Mid Fdamntl ETF
PZW\tPwrshr FTSE RAFI Glb Sml Mid Fdamntl ETF
QBB\tMackenzie CDN Aggregate Bond Index ETF
QBTL\tAgfiq US Mkt Neut Antibeta CAD Hdg ETF
QCD\tQuantshrs Enh Core CDN Equity ETF
QCE\tMackenzie CDN Large Cap Equity Index ETF
QCLN\tFirst Trust Nsdq Cln Edg Green Enrgy ETF
QCN\tMackenzie Canadian Equity Index ETF
QDX\tMackenzie International Equity Index ETF
QDXB\tMackenzie Dev Ex Na Agg Bond Idx Hgd ETF
QEBH\tMackenzie Emerging Mkts Bond Index ETF
QEBL\tMackenzie Emerging Mkts Local Cur Bd ETF
QEM\tQuantshrs Enh Core Emg Mkt Eqt ETF
QIE\tQuantshrs Enh Core Intl Equity ETF
QINF\tMackenzie Global Infrastructure Indx ETF
QMA\tQuantshrs Multiasset Allocation ETF
QQC\tInvesco Nasdaq 100 Index ETF
QQC.F\tInvesco QQQ Index ETF
QQEQ\tInvesco Nasdaq 100 Equal Weight Indx ETF
QQEQ.F\tInvesco Nasdaq 100 Eql Weight Idx HD ETF
QQJR\tInvesco Nasdaq Next Gen 100 Index ETF
QQJR.F\tInvesco Nasdaq Next Gen 100 Index HD ETF
QSB\tMackenzie CDN Short Term Bond Index ETF
QUB\tMackenzie US Aggregate Bond Indx Hgd ETF
QUS\tQuantshrs Enh Core US Equity ETF
QUU\tMackenzie US Large Cap Equity Index ETF
QUU.U\tMackenzie US Large Cap Eqty Indx USD ETF
QXM\tCI First Asset Morningstar Nb Quebec ETF
RATE\tArrow Ec Income Advantage Alt Fund ETF
RBDI\tRBC Bluebay Global Income ETF
RBNK\tRBC CDN Bank Yield Index ETF
RBO\tRBC 1 To 5 Yr Laddered Corp Bond ETF
RBOT\tHorizons Robotics Automation Idx ETF
RBOT.U\tHorizons Robotics and Automa Idx ETF USD
RCD\tRBC Quant CDN Dividend Leaders ETF
RCE\tRBC Quant Canadian Equity Leaders ETF
REIT\tPowershares Sptsx REIT Income Idx ETF
RID\tRBC Quant EAFE Div Leaders ETF
RID.U\tRBC Quant EAFE Div Leaders USD ETF
RIDH\tRBC Quant EAFE Div Leaders ETF
RIE\tRBC Quant EAFE Equity Leaders ETF
RIE.U\tRBC Quant EAFE Equity Leaders ETF USD
RIEH\tRBC Quant EAFE Equity Leaders CAD Heg ETF
RIFI\tRussell Invt Fixed Income Pool ETF
RIIN\tRussell Invt Global Infr Pool ETF
RIRA\tRussell Invt Real Assets ETF
RIT\tCI First Asset Canadian REIT ETF
RLB\tRBC 1 To 5 Year Laddered Can Bond ETF
RPD\tRBC Quant European Div Leaders ETF
RPD.U\tRBC Quant European Div Leaders ETF USD
RPDH\tRBC Quant European Div Leaders ETF
RPF\tRBC Canadian Pref Share ETF
RPSB\tRBC Phn Short Term CDN Bond ETF
RQI\tRBC Target 2021 Corp Bond Index ETF
RQJ\tRBC Target 2022 Corp Bond ETF
RQK\tRBC Target 2023 Corp Bond ETF
RQL\tRBC Target 2024 Corp Bond Index ETF
RQN\tRBC Target 2025 Corp Bond Index ETF
RQO\tRBC Target 2026 Corporate Bond Index ETF
RQP\tRBC Target 2027 Corporate Bond Index ETF
RUBH\tRBC US Banks Yield CAD Hgd Index ETF
RUBY\tRBC US Banks Yield Index ETF CAD
RUBY.U\tRBC US Banks Yield Index ETF USD
RUD\tRBC Quant US Div Leaders ETF
RUD.U\tRBC Quant US Div Leaders USD ETF
RUDH\tRBC Quant US Div Leaders ETF
RUE\tRBC Quant US Equity Leaders ETF
RUE.U\tRBC Quant US Equity Leaders ETF USD
RUEH\tRBC Quant US Equity Leaders CAD Heg ETF
RUSB\tRBC Short Term US Corp Bond ETF
RWC\tCI First Asset MSCI Canada Low Risk Wtd ETF
RWE\tCI First Asset MSCI Europe Lr Wgtd ETF
RWE.B\tCI First Asset MSCI Europe Lr Wgtd Unhg ETF
RWU\tCI First Asset MSCI USA Lr Wgtd ETF
RWU.B\tCI First Asset MSCI USA Lr Wgtd Unhedg ETF
RWW\tCI First Asset MSCI World Low Risk Wtd ETF
RWW.B\tCI First Asset MSCI Wld Lr Wtd Uh ETF
RWX\tCI First Asset MSCI Intl Low Risk Weighted ETF
RXD\tRBC Quant Emrg Mkts Div Leaders ETF
RXD.U\tRBC Quant Emrg Mkts Div Leaders ETF USD
RXE\tRBC Quant Emrg Mkts Equity Leaders ETF
RXE.U\tRBC Quant Emrg Mkts Eqt Leaders ETF USD
SBT\tPurpose Silver Bullion ETF
SBT.B\tSilver Bullion Trust CAD ETF Non Cur
SBT.U\tSilver Bullion Trust USD ETF Non Cur
SID\tCI First Asset US Trendleaders ETF
SIXT\tEvolve SP TSX 60 Cleanbeta Fund Uh ETF
SKYY\tFirst Trust Cloud Computing ETF
STPL\tBMO Glb Consumer Staples Hgd To CAD ETF
SVR\tIshares Silver Bullion ETF Hdg
SVR.C\tIshares Silver Bullion ETF Non Hdg
TCLB\tTD Canadian Long Term Fed Bond ETF
TCLV\tTD Q Canadian Low Volatility ETF
TDB\tTD CDN Aggregate Bond Index ETF
TDOC\tTD Global Healthcare Leaders Index ETF
TEC\tTD Global Technology Leaders Index ETF
TECH\tEvolve Fangma Index ETF [Cad Hedged Unit
TECH.B\tEvolve Fangma Index ETF [Cad Unhedged Un
TECH.U\tEvolve Fangma Index Uh ETF USD
TERM\tManulife Smart Short-Term Bond ETF
TGED\tTD Active Global Enhanced Dividend ETF
TGFI\tTD Active Global Income ETF
TGGR\tTD Active Global Equity Growth ETF
TGRE\tTD Active Global Real Estate Equity ETF
The\tTD Intl Equity CAD Hedge Index ETF
THU\tTD S&P 500 CAD Hedge Index ETF
TILV\tTD Systematic Intl Equity Low Vol ETF
TINF\tTD Active Global Infrastructure Eqty ETF
TLF\tBrompton Tech Leaders Income ETF
TLF.U\tBrompton Tech Leaders Income ETF USD
TLV\tInvesco SP TSX Low Vol Idx ETF
TMEC\tTD Morningstar ESG Cda Eqty Idx ETF
TMEI\tTD Morningstar ESG Intl Eqty Idx ETF
TMEU\tTD Morningstar ESG US Equity Index ETF
TOCA\tTD One Click Aggressive Portfolio ETF
TOCC\tTD One Click Conservative ETF Portfolio
TOCM\tTD One Click Moderate ETF Portfolio
TPAY\tTD Income Builder ETF
TPE\tTD International Equity Index ETF
TPRF\tTD Active Preferred Share ETF
TPU\tTD S&P 500 Index ETF
TQCD\tTD Q Canadian Dividend ETF
TQGD\tTD Q Global Dividend ETF
TQGM\tTD Q Global Multifactor ETF
TQSM\tTD Q US Small Mid Cap Eqty ETF
TRVL\tHarvest Travel and Leisure Index ETF
TRVL.U\tHarvest Travel and Leisure ETF USD
TTP\tTD S&P TSX Capped Comp Index ETF
TUED\tTD Active US Enhanced Dividend ETF
TUHY\tTD Active US High Yield Bond ETF
TULB\tTD US Long Term Treasury Bond ETF
TULV\tTD Q US Low Volatility ETF
TUSB.U\tTD Select US Short Term Corp Bnd ETF USD
TXF\tCI First Asset Tech Giants Covered Call ETF
UDA\tCaldwell US Dividend Advantage Fund ETF
UDIV\tManulife Smart U.S. Dividend ETF [Hedged
ULV.C\tPowershares Sp500 Low Volatility ETF
ULV.F\tInvesco S&P 500 Low Volatility ETF
ULV.U\tInvesco S&P 500 Low Volatility ETF USD
UMI\tCI Wisdomtree US Midcap Div Idx ETF
UMI.B\tWisdomtree US Midcap Div Idx Unheg ETF
USB\tPowershares Lad US 0 To 5 Yr Corp Bd ETF
USB.U\tPowershares Lad US 0 To 5 Yr Corp Bd ETF USD
VA\tVanguard FTSE Dev Asia Pac All Cap ETF
VAB\tVanguard CDN Aggregate Bond Index ETF
VALT\tCI Gold Bullion Fund ETF Hg CAD
VALT.B\tCI Gold Bullion Fund ETF
VALT.U\tCI Gold Bullion Fund ETF USD
VBAL\tVanguard Balanced ETF Portfolio
VBG\tVanguard Global Ex US Agg Bnd ETF
VBU\tVanguard US Agg Bond Index ETF CAD
VCB\tVanguard CDN Corporate Bond Index ETF
VCE\tVanguard FTSE Canada Index ETF
VCIP\tVanguard Conservative Income ETF
VCN\tVanguard FTSE Canada All Cap ETF
VCNS\tVanguard Conservative ETF Portfolio
VDU\tVanguard FTSE Developed AC Ex US ETF
VDY\tVanguard FTSE CDN High Div Yld Index ETF
VE\tVanguard FTSE Dev Europe All Cap ETF
VEE\tVanguard FTSE Emerging Mkts All Cap ETF
VEF\tVanguard FTSE Dev AC Ex US ETF CAD Hdg
VEQT\tVanguard All Equity ETF Portfolio
VFV\tVanguard S&P 500 Index ETF
VGAB\tVanguard Global Aggregate Bond Index ETF
VGG\tVanguard US Div Appr ETF
VGH\tVanguard US Div Appr ETF CAD Hdg
VGRO\tVanguard Growth ETF Portfolio
VGV\tVanguard CDN Government Bond Index ETF
VI\tVanguard FTSE Dev All Cap Na ETF
VIDY\tVanguard FTSE Dev Ex Na High Div Yld ETF
VIU\tVanguard FTSE Dev All Cap Na ETF
VLB\tVanguard CDN Long Term Bond Index ETF
VMO\tVanguard Glob Momentum Factor ETF
VRE\tVanguard FTSE CDN Capped REIT Index ETF
VRIF\tVanguard Retirement Income ETF
VSB\tVanguard CDN Short-Term Bond Index ETF
VSC\tVanguard CDN Short Term Corp Bd ETF
VSP\tVanguard S&P 500 Index ETF CAD Hdg
VUN\tVanguard US Total Market ETF
VUS\tVanguard US Total Mkt ETF CAD Hdg
VVL\tVanguard Glob Val Factor ETF
VVO\tVanguard Global Min Vol ETF
VXC\tVanguard FTSE Global All Cap Ex Can ETF
VXM\tCI First Asset Morningstar Intl Value ETF
VXM.B\tCI First Asset Morningstar Intl Value ETF Unheg
WSRD\tWealthsimple Dev Mkt Ex Na Soc Resp ETF
WSRI\tWealthsimple Na Socially Resp Index ETF
WXM\tCI First Asset Morningstar Cda Momentum ETF
XAW\tIshares Core MSCI All Cntry Ex Can ETF
XAW.U\tIshares Core MSCI All Ex Can ETF USD
XBAL\tIshares Core Balanced ETF Portfolio
XBB\tIshares Core CDN Universe Bond ETF
XBM\tIshares S&P TSX Global Base Mtls ETF
XCB\tIshares Canadian Corporate Bond ETF
XCBU\tIshares US IG Corporate Bond Index ETF
XCBU.U\tIshares US IG Corporate Bond Idx ETF USD
XCD\tIshares S&P Global Cons Disc ETF
XCG\tIshares Canadian Growth Index ETF
XCH\tIshares China Index ETF
XCLR\tIshares ESG MSCI Canada Leaders Indx ETF
XCNS\tIshares Core Conservative Balanced ETF
XCS\tIshares S&P TSX Smallcap Index ETF
XCSR\tIshares ESG Advanced MSCI Canada Idx ETF
XCV\tIshares Canadian Value Index ETF
XDG\tIshares Core MSCI Glo Qlty Div ETF
XDG.U\tIshares Core MSCI Glo Qlty Div ETF USD
XDGH\tIshares Core MSCI Glo Qlty Div ETF
XDIV\tIshares Core MSCI CAD Qlty Div ETF
XDLR\tIshares ESG MSCI EAFE Leaders Index ETF
XDSR\tIshares ESG Advanced MSCI EAFE Index ETF
XDU\tIshares Core MSCI US Qlty Div ETF
XDU.U\tIshares Core MSCI US Qlty Div ETF USD
XDUH\tIshares Core MSCI US Qlty Div ETF
XDV\tIshares Canadian Select Div Index ETF
XEB\tIshares JP Morgan USD Emerg Mkts Bd ETF
XEC\tIshares Core MSCI Emerging Mkts IMI ETF
XEC.U\tIshares Core MSCI Emrgng Mkt IMI ETF
XEF\tIshares Core MSCI EAFE IMI Index ETF
XEF.U\tIshares Core MSCI EAFE IMI Index ETF
XEG\tIshares S&P TSX Capped Energy Index ETF
XEH\tIshares MSCI Europe IMI Index ETF
XEI\tIshares S&P TSX Comp High Div Index ETF
XEM\tIshares MSCI Emerging Markets ETF
XEN\tIshares Jantzi Social Index ETF
XEQT\tIshares Core Equity ETF
XESG\tIshares ESG MSCI Cda Index ETF
XEU\tIshares MSCI Europe IMI Index ETF
XFC\tIshares Edge MSCI Multifact Can ETF
XFH\tIshares Core MSCI EAFE IMI Index ETF
XFI\tIshares Edge MSCI Multifact EAFE ETF
XFN\tIshares S&P TSX Capped Financials ETF
XFR\tIshares Floating Rate Index ETF
XFS\tIshares Edge MSCI Multifact USA ETF
XFS.U\tIshares MSCI Multifactor USA Idx ETF USD
XGB\tIshares Canadian Govt Bond Index ETF
XGD\tIshares S&P TSX Global Gold Index ETF
XGI\tIshares S&P Global Industrials ETF
XGRO\tIshares Core Growth ETF Portfolio
XHB\tIshares CDN Hybrid Corp Bond ETF
XHC\tIshares Global Healthcare Index ETF
XHD\tIshares US High Div Equity Index ETF
XHU\tIshares US High Div Equity Index ETF
XHY\tIshares US High Yield Bond Index ETF
XIC\tIshares Core S&P TSX Capped Comp ETF
XID\tIshares India Index ETF
XIG\tIshares US IG Corporate Bond Index ETF
XIGS\tIshares 1 To 5 Year US IG Corp Bond ETF
XIN\tIshares MSCI EAFE Index ETF
XINC\tIshares Core Income Balanced ETF
XIT\tIshares S&P TSX Capped Info Tech ETF
XIU\tIshares S&P TSX 60 Index ETF
XLB\tIshares Core CDN Long Term Bond ETF
XMA\tIshares S&P TSX Capped Materials ETF
XMC\tIshares S&P US Midcap Index ETF
XMC.U\tIshares SP US Midcap ETF USD
XMD\tIshares S&P TSX Completion Index ETF
XMH\tIshares S&P US Midcap Index ETF CAD Hgd
XMI\tIshares Edge MSCI Min Vol EAFE ETF
XML\tIshares Edge MSCI Mv EAFE ETF CAD Hgd
XMM\tIshares Edge MSCI Min Vol Emerg ETF
XMS\tIshares Edge MSCI Mv USA ETF CAD Hgd
XMTM\tIshares Edge MSCI USA Momnt Fctr ETF
XMU\tIshares Edge MSCI Min Vol USA ETF
XMU.U\tIshares Edge MSCI Min Vol USA Index ETF
XMV\tIshares Edge MSCI Min Vol Can ETF
XMW\tIshares Edge MSCI Min Vol Gbl ETF
XMY\tIshares Edge MSCI Mv Global ETF CAD Hgd
XPF\tIshares S&P TSX Na Pref Stock ETF
XQB\tIshares High Qlty Canadian Bond ETF
XQLT\tIshares Edge MSCI USA Qlty Fctr Indx ETF
XQQ\tIshares Nasdaq 100 Index ETF
XRB\tIshares CDN Real Return Bond Index ETF
XRE\tIshares S&P TSX Capped REIT Index ETF
XSAB\tIshares ESG CDN Agg Bond Index ETF
XSB\tIshares Core CDN Short Trm Bond ETF
XSC\tIshares Cons ST Strat Fix Inc ETF
XSE\tIshares Cons Strat Fix Inc ETF
XSEA\tIshares ESG MSCI EAFE Index ETF
XSEM\tIshares ESG MSCI Emerg Mkts Index ETF
XSH\tIshares Core CDN ST Corp Maple Bnd ETF
XSI\tIshares Short Term Strategic FI ETF
XSMC\tIshares SP US Small Cap Index ETF
XSMH\tIshares SP US Small Cap ETF CAD Hdg
XSP\tIshares Core S&P 500 ETF CAD Hdg ETF
XSQ\tIshares ST HI Qlty CDN Bond ETF
XST\tIshares S&P TSX Capped Cons Stpl ETF
XSTB\tIshares ESG CDN ST Bond Index ETF
XSTH\tIshares 0 To 5 Year TIPS Bond Idx HD ETF
XSTP\tIshares 0 To 5 Year TIPS Bond Index ETF
XSTP.U\tIshares 0 To 5 Yr TIPS Bond Idx ETF USD
XSU\tIshares US Small Cap Index ETF
XSUS\tIshares ESG MSCI USA Index ETF
XTR\tIshares Diversified Monthly Income ETF
XUH\tIshares Core S&P US Total Mkt ETF CAD Heg
XULR\tIshares ESG MSCI USA Leaders Index ETF
XUS\tIshares Core S&P 500 Index ETF
XUS.U\tIshares Core SP 500 Index ETF
XUSR\tIshares ESG Advanced MSCI USA Index ETF
XUT\tIshares S&P TSX Capped Utilities ETF
XUU\tIshares Core S&P US Total Market ETF
XUU.U\tIshares Core SP US Total Market ETF USD
XVLU\tIshares Edge MSCI USA Value Fctr ETF
XWD\tIshares MSCI World Index ETF
XXM\tCI First Asset Morningstar US Value Index ETF
YXM\tCI First Asset Morningstar US Momentum Index ETF
ZACE\tBMO US All Cap Equity Fund ETF
ZAG\tBMO Aggregate Bond Index ETF
ZAUT\tBMO MSCI Tech Industrial Innov Idx ETF
ZBAL\tBMO Balanced ETF
ZBBB\tBMO BBB Corporate Bond Index ETF
ZBK\tBMO Equal Weight US Bank ETF
ZCB\tBMO Corporate Bond Index ETF
ZCH\tBMO China Equity Index ETF
ZCLN\tBMO Clean Energy Index ETF
ZCM\tBMO Mid Corporate Bond ETF
ZCN\tBMO S&P TSX Capped Comp ETF
ZCON\tBMO Conservative ETF
ZCS\tBMO Short Corp Bond ETF
ZCS.L\tBMO Short Corporate Bond ETF
ZDB\tBMO Discount Bond ETF
ZDH\tBMO Intl Div CAD Hedge ETF
ZDI\tBMO International Dividend ETF
ZDJ\tBMO DJIA Hedged To CAD Index ETF
ZDM\tBMO MSCI EAFE Hedged To CAD Index ETF
ZDV\tBMO Canadian Dividend ETF
ZDY\tBMO US Dividend ETF CAD
ZDY.U\tBMO US Dividend ETF USD
ZEA\tBMO MSCI EAFE ETF
ZEB\tBMO S&P TSX Equal Weight Banks Index ETF
ZEF\tBMO Emg Mkt Bond Hdgd To CAD ETF
ZEM\tBMO MSCI Emerging Markets Index ETF
ZEO\tBMO S&P TSX Eql Weight Oil Gas Index ETF
ZEQ\tBMO MSCI EU Hq Hcad ETF
ZESG\tBMO Balanced ESG ETF
ZFH\tBMO Floating Rate High Yield ETF
ZFIN\tBMO MSCI Fintech Innovation Index ETF
ZFL\tBMO Long Fed Bond Index ETF
ZFM\tBMO Mid Federal Bond Index ETF
ZFS\tBMO Short Federal Bond Index ETF
ZFS.L\tBMO Short Federal Bond Index ETF
ZGB\tBMO Government Bond Index ETF
ZGD\tBMO S&P TSX Eql Weight Global Gold ETF
ZGEN\tBMO MSCI Genomic Innovation Index ETF
ZGI\tBMO Global Infrastructure Index ETF
ZGQ\tBMO MSCI All Cntry Wrld High Qlty ETF
ZGRO\tBMO Growth ETF
ZHP\tBMO US Pref Share Hgd To CAD ETF
ZHU\tBMO Equal Weight US Health Care Idx ETF
ZHY\tBMO High Yld US Corp Bnd Hdg CAD ETF
ZIC\tBMO Mid Term US IG Corp Bond ETF
ZIC.U\tBMO Mid Term US IG Corp Bond ETF USD
ZID\tBMO India Equity Index ETF
ZIN\tBMO S&P TSX Equal Weight Indstrl ETF
ZINN\tBMO MSCI Innovation Index ETF
ZINT\tBMO MSCI Next Gen Internet Innov Idx ETF
ZJG\tBMO Junior Gold Index ETF
ZJK\tBMO High Yield US Corp Bond ETF
ZLB\tBMO Low Volatility CAD Equity ETF
ZLC\tBMO Long Corporate Bond Index ETF
ZLD\tBMO Low Vol Intl Eqty Hed To CAD ETF
ZLE\tBMO Low Vol Emerg Mkt Equity ETF
ZLH\tBMO Low Vol US Eqty Hed To CAD ETF
ZLI\tBMO Low Vol Intl Equity ETF
ZLU\tBMO Low Volatility US Equity ETF CAD
ZLU.U\tBMO Low Volatility US Equity ETF USD
ZMBS\tBMO Canadian MBS Index ETF
ZMI\tBMO Monthly Income ETF
ZMID\tBMO SP US Mid Cap Index ETF
ZMID.F\tBMO SP US Mid Cap Index ETF Hedged
ZMID.U\tBMO SP US Mid Cap Index ETF USD
ZMP\tBMO Mid Provincial Bond Index ETF
ZMT\tBMO Sptsx Eql Wgt Glb Metal Hed CAD ETF
ZNQ\tBMO Nasdaq 100 Equity Index ETF
ZNQ.U\tBMO Nasdaq 100 Equity Index ETF USD
ZPAY\tBMO Premium Yield ETF
ZPAY.F\tBMO Premium Yield ETF Hedged
ZPAY.U\tBMO Premium Yield ETF USD
ZPH\tBMO US Put Write Hedged To CAD ETF
ZPL\tBMO Long Provincial Bond Index ETF
ZPR\tBMO Laddered Pref Share ETF
ZPS\tBMO Short Provincial Bond Index ETF
ZPS.L\tBMO Short Provincial Bond Index ETF
ZPW\tBMO US Put Write ETF
ZPW.U\tBMO US Put Write ETF USD
ZQB\tBMO High Quality Corporate Bond Idx ETF
ZQQ\tBMO Nasdaq 100 Hedged To CAD Index ETF
ZRE\tBMO Equal Weight Reits Index ETF
ZRR\tBMO Real Return Bond Index ETF
ZSB\tBMO Short Term Bond Idx ETF
ZSML\tBMO SP US Small Cap Index ETF
ZSML.F\tBMO SP US Small Cap Index ETF Hedged
ZSML.U\tBMO SP US Small Cap Index ETF USD
ZSP\tBMO S&P 500 Index ETF
ZSP.U\tBMO S&P 500 Index ETF USD
ZST\tBMO Ultra Short Term Bond ETF
ZST.L\tBMO Ultra Short Term Bond ETF
ZSU\tBMO ST US IG Corp Bond Hcad ETF
ZTIP\tBMO Short Term US TIPS Index ETF
ZTIP.F\tBMO Short Term US TIPS Index Hgd ETF
ZTIP.U\tBMO Short Term US TIPS Index ETF USD
ZUB\tBMO Eql Wgt US Bank Hdgd To CAD ETF
ZUD\tBMO US Dividend Hedged To CAD ETF
ZUE\tBMO S&P 500 Hedged CAD ETF
ZUH\tBMO Eql Wgt US Hcare Hdgd To CAD ETF
ZUP\tBMO US Pref Share Index ETF
ZUP.U\tBMO US Pref Share Index ETF
ZUQ\tBMO MSCI USA High Quality Index ETF
ZUQ.F\tBMO MSCI USA High Quality Index ETF [Hed
ZUQ.U\tBMO MSCI USA High Quality Index ETF USD
ZUS.U\tBMO Ultra Short Term US Bond ETF USD
ZUS.V\tBMO Ultra Short Term US Bond ETF USD Acc
ZUT\tBMO Equal Weight Utilities Index ETF
ZVC\tBMO MSCI Cda Value Index ETF
ZVU\tBMO MSCI USA Value Index ETF
ZWA\tBMO Covered Call DJIA CAD ETF
ZWB\tBMO Covered Call Canadian Banks ETF
ZWC\tBMO CDN High Div Covered Call ETF
ZWE\tBMO Europe High Div CC CAD Hedge ETF
ZWG\tBMO Gbl High Dividend Covered Call ETF
ZWH\tBMO US High Dividend Covered Call ETF
ZWH.U\tBMO US High Dividend Cov Call ETF USD
ZWK\tBMO Covered Call US Banks ETF
ZWP\tBMO Europe High Div Cov Call ETF
ZWS\tBMO US High Div Cov Call Hgd ETF
ZWT\tBMO Covered Call Technology ETF
ZWU\tBMO Covered Call Utilities ETF
ZXM\tCI First Asset Morningstar Intl Momentum ETF
ZXM.B\tCI First Asset Morningstar Intl Momentum ETF
ZZZD\tBMO Tactical Dividend ETF Fund
ACB.WT.U\tAurora Cannabis Inc Wts USD
ACB.WT.V\tAurora Cannabis Inc Wts V USD
ADCO.WT\tAdcore Inc Wts
AH.WT\tAleafia Health Inc Wts
AH.WT.A\tAleafia Health Inc Wts A
AH.WT.B\tAleafia Health Inc Wts B
AHC.WT\tApollo Healthcare Corp Wts
ARIS.WT\tAris Gold Corp Wts
ASND.WT\tAscendant Resources Inc Wts
AVNT.WT\tAvant Brands Inc Wts
CBD.WT.U\tHempfusion Wellness Inc Wts USD
CBD.WT.V\tHempfusion Wellness Inc Wts V USD
CFW.WT\tCalfrac Well Services Ltd Wts
CHR.WT\tChorus Aviation Inc
CRDL.WT.A\tCardiol Therapeutics Inc. Purchase Warrants
CVE.WT\tCenovus Energy Inc Wts
CWEB.WT\tCharlottes Web Holdings Inc
DBO.WT\tD Box Technologies Inc Wts
DYA.WT\tDynacert Inc
EFR.WT\tEnergy Fuels Inc WT
EPRX.WT\tEupraxia Pharmaceuticals Inc Wts
EQX.WT\tEquinox Gold Corp WT
EXN.WT\tExcellon Resources Inc WT
FLOW.WT\tFlow Beverage Corp
FTRP.WT\tField Trip Health Ltd. Wts
FXC.WT\tFax Capital Corp Wts
GCM.WT.B\tGran Colombia Gold Corp WT B
HEXO.WT\tHexo Corp Wts
HUT.WT\tHut 8 Mining Corp Wts
HUT.WT.A\tHut 8 Mining Corp Wts A
KRR.WT\tKarora Resources Inc Wts
LABS.WT\tMedipharm Labs Corp Wts
LEV.WT\tThe Lion Electric Company Wts
LXR.WT\tLxrandco Inc WT
MIN.WT\tExcelsior Mining Corp Wts
MOGO.WT\tMogo Inc Wts
NAC.WT.U\tNextpoint Acquisition Corp USD Wts
NCU.WT\tNevada Copper Corp.
NCU.WT.A\tNevada Copper Corp Wts A
NPF.WT.U\tNextpoint Financial Inc Wts
NSR.WT\tNomad Royalty Company Ltd Wts
NVO.WT\tNovo Resources Corp Wts
NVO.WT.A\tNovo Resources Corp Wts A
ONC.WT\tOncolytics Biotech Inc WT
OR.WT\tOsisko Gold Royalties Ltd WT
RVX.WT.A\tResverlogix Corp WT
SFC.WT\tSagicor Financial Company Ltd Wts
SPG.WT\tSpark Power Group Inc WT
STCK.WT\tStack Capital Group Inc Wts
SZLS.WT\tStagezero Life Sciences Ltd Wts
TAIG.WT\tTaiga Motors Corporation Wts
TBP.WT.A\tTetra Bio Pharma Inc WT A
TBP.WT.B\tTetra Bio Pharma Inc Wts B
TBP.WT.C\tTetra Bio-Pharma Inc
TLG.WT\tTroilus Gold Corp Wts
TMD.WT.I\tTitan Medical Inc WT Cl I
TML.WT\tTreasury Metals Inc Wts
TRL.WT\tTrilogy International Partners Inc WT
TV.WT\tTrevali Mining Corporation Wts
VIVO.WT\tVivo Cannabis Inc.
VWE.WT.U\tVintage Wine Estates Inc Wts USD
WEED.WT\tCanopy Growth Corporation Wts
WEED.WT.A\tCanopy Growth Corporation February 2021 Warrants
Y.WT\tYellow Pages Limited WT
AIM.PR.A\tAimia Inc Pref Ser 1
AIM.PR.C\tAimia Inc Pref Ser 3
ALA.PR.A\tAltagas Ltd Pref A
ALA.PR.B\tAltagas Ltd Pref Ser B
ALA.PR.E\tAltagas Ltd Pref Ser E
ALA.PR.G\tAltagas Ltd Pref G
ALA.PR.H\tAltagas Ltd Pref H
ALA.PR.K\tAltagas Ltd Pref Ser K
ALA.PR.U\tAltagas Ltd Pref Ser C
AQN.PR.A\tAlgonquin Power and Utilities Pref A
AQN.PR.D\tAlgonquin Power and Utilities Pref D
AX.PR.A\tArtis REIT Pref Ser A
AX.PR.E\tArtis REIT Pref Ser E
AX.PR.I\tArtis REIT Pref Series I
BAM.PR.B\tBrookfield Asset Mgmt Inc Pr. Ser 2
BAM.PR.C\tBrookfield Asset Mgmt Inc Pr. Ser 4
BAM.PR.E\tBrookfield Asset Mgmt Inc Pr. Ser 8
BAM.PR.G\tBrookfield Asset Mgmt Inc Pr Ser 9
BAM.PR.K\tBrookfield Asset Mgmt Inc Pr. Ser 13
BAM.PR.M\tBrookfield Asset Mgmt Inc Prf A Ser 17
BAM.PR.N\tBrookfield Asset Mgmt Pref Shs Ser 18
BAM.PR.R\tBrookfield Asset Mgmt Pref Ser 24
BAM.PR.T\tBrookfield Asset Mgmt Pref Ser 26
BAM.PR.X\tBrookfield Am Pref Ser 28
BAM.PR.Z\tBrookfield Asset Mgmt Inc Pr Ser 30
BBD.PR.B\tBombardier 2 Pr
BBD.PR.C\tBombardier Inc Pref Class C
BBD.PR.D\tBombardier Inc Pref Ser 3
BCE.PR.A\tBCE First Pr Shares Series Aa
BCE.PR.B\tBCE Inc First Pr Shares Series Ab
BCE.PR.C\tBCE Inc Pr Shares Series AC
BCE.PR.D\tBCE Inc Pref Shares Series Ad
BCE.PR.E\tBCE 1st Pref Shares Series Ae
BCE.PR.F\tBCE 1st Pref Shares Series Af
BCE.PR.G\tBCE 1st Pref Shares Series Ag
BCE.PR.H\tBCE 1st Pref Shares Series Ah
BCE.PR.I\tBCE 1st Pref Shares Series Ai
BCE.PR.J\tBCE Inc Pref Sh Series Aj
BCE.PR.K\tBCE Inc Pref Ser AK
BCE.PR.L\tBCE Inc Pref Ser AL
BCE.PR.M\tBCE Inc Pref Shares Series Am
BCE.PR.N\tBCE Inc Pref Shares Series An
BCE.PR.O\tBCE Inc Pref Shares Series Ao
BCE.PR.Q\tBCE Inc Pref Shares Series Aq
BCE.PR.R\tBCE Inc Ser R
BCE.PR.S\tBCE Inc Ser S
BCE.PR.T\tBCE Inc First Pref Series T
BCE.PR.Y\tBCE Inc Ser Y Pr
BCE.PR.Z\tBCE Inc Series Z
BEP.PR.E\tBrookfield Renewable LP Pref Ser 5
BEP.PR.G\tBrookfield Renewable LP Pref Ser 7
BEP.PR.I\tBrookfield Renewable Pref Ser 9
BEP.PR.K\tBrookfield Renewable LP Pref Ser 11
BEP.PR.M\tBrookfield Renewable LP Pref Ser 13
BEP.PR.O\tBrookfield Renewable Partners L.P.
BIK.PR.A\tBip Investment Corp Pref Ser 1
BIP.PR.A\tBrookfield Infra Partners LP Pref Ser 1
BIP.PR.B\tBrookfield Infra Partners LP Pref Ser 3
BIP.PR.C\tBrookfield Infra Partners LP Pref Ser 5
BIP.PR.D\tBrookfield Infra Partners LP Pref Ser 7
BIP.PR.E\tBrookfield Infra Partners LP Pref Ser 9
BIP.PR.F\tBrookfield Infra Partners LP Pref Ser 11
BIR.PR.A\tBirchcliff Energy Ltd Pref Sh A
BIR.PR.C\tBirchcliff Energy Ltd Pref Ser C
BK.PR.A\tCanadian Banc Corp Pref A
BMO.PR.A\tBMO Pref Shares Series 26
BMO.PR.B\tBMO Pref Shares Series 38
BMO.PR.C\tBMO Pref Shares Series 40
BMO.PR.D\tBMO Pref Shares Series 42
BMO.PR.E\tBMO Pref Shares Series 44
BMO.PR.F\tBMO Pref Shares Series 46
BMO.PR.Q\tBank of Montreal B Pref Sh Ser 25
BMO.PR.S\tBMO Cl B Pref Shares Ser 27
BMO.PR.T\tBMO Non Cum Cl B Prf Share Series 29
BMO.PR.W\tBMO Cl B Pref Shares Ser 31
BMO.PR.Y\tBank of Montreal Pref Ser 33
BNK.PR.A\tBig Banc Split Corp
BNS.PR.G\tBns Pref Shares Series 36
BNS.PR.H\tBns Pref Shares Series 38
BNS.PR.I\tBns Preferred Shares Series 40
BPO.PR.A\tBrookfield Office Properties Pref Ser Aa
BPO.PR.C\tBrookfield Office Properties Pref Ser CC
BPO.PR.E\tBrookfield Office Properties Pref Ser Ee
BPO.PR.G\tBrookfield Office Properties Pref Ser G
BPO.PR.I\tBrookfield Office Properties Pref Ser II
BPO.PR.N\tBrookfield Office Properties Pref Ser N
BPO.PR.P\tBrookfield Office Properties Pref Ser P
BPO.PR.R\tBrookfield Office Properties Pref Ser R
BPO.PR.S\tBrookfield Office Properties Pref Ser S
BPO.PR.T\tBrookfield Office Properties Pref Ser T
BPO.PR.W\tBrookfield Office Properties Pref Ser W
BPO.PR.X\tBrookfield Office Properties Pref Ser V
BPO.PR.Y\tBrookfield Office Properties Pref Ser Y
BPS.PR.A\tBrookfield Property Split Pref Ser 2
BPS.PR.B\tBrookfield Property Split Pref Ser 3
BPS.PR.C\tBrookfield Property Split Pref Ser 4
BPS.PR.U\tBrookfield Property Split Pref Ser 1
BPYP.PR.A\tBrookfield Property Preferred L.P.
BRF.PR.A\tBrookfield Renewable Pref Cl A Ser 1
BRF.PR.B\tBrookfield Renewable Pref Cl A Ser 2
BRF.PR.C\tBrookfield Renewable Power Pref Eqty Inc
BRF.PR.E\tBrookfield Renewable Power Pref Eqt Sr 5
BRF.PR.F\tBrookfield Renewable Power Pref Eqt Sr 6
CCS.PR.C\tCo-Operators Gen Ins Cl E Prf
CF.PR.A\tCanaccord Genuity Group Inc Pref A
CF.PR.C\tCanaccord Genuity Group Inc Pref C
CGI.PR.D\tCanadian General Inv Ltd Pref Ser 4
CIU.PR.A\tCu Inc Pref Shares
CIU.PR.C\tCu Inc Pref Ser 4
CM.PR.O\tCIBC Pref Ser 39
CM.PR.P\tCIBC Pref Ser 41
CM.PR.Q\tCIBC Pref Ser 43
CM.PR.R\tCIBC Pref Ser 45
CM.PR.S\tCIBC Pref Series 47
CM.PR.T\tCIBC Pref Series 49
CM.PR.Y\tCIBC Pref Series 51
CPX.PR.A\tCapital Power Corporation Pref Ser 1
CPX.PR.C\tCapital Power Corp Pref Ser 3
CPX.PR.E\tCapital Power Corporation Pref Ser 5
CPX.PR.G\tCapital Power Corporation Pref Ser 7
CPX.PR.I\tCapital Power Corporation Pref Ser 9
CPX.PR.K\tCapital Power Corporation Pref Series 11
CSE.PR.A\tCapstone Infrastructure Corp Pref A
CU.PR.C\tCanadian Utilities Limited Pref Ser C
CU.PR.D\tCanadian Utilities Ltd Pr Series Aa
CU.PR.E\tCanadian Utilities Ltd Pref Ser Bb
CU.PR.F\tCanadian Utilities Ltd Pref Ser CC
CU.PR.G\tCanadian Utilities Ltd Pref Ser Dd
CU.PR.H\tCanadian Utilities Ltd Pref Ser Ee
CU.PR.I\tCanadian Utilities Ltd Pref Ser Ff
CVE.PR.A\tCenovus Energy Inc
CVE.PR.B\tCenovus Energy Inc
CVE.PR.C\tCenovus Energy Inc
CVE.PR.E\tCenovus Energy Inc
CVE.PR.G\tCenovus Energy Inc
CWB.PR.B\tCanadian Western Bank Pref Ser 5
CWB.PR.C\tCanadian Western Bank Pref Ser 7
CWB.PR.D\tCanadian Western Bank Pref Series 9
DC.PR.B\tDundee Corp First Pref Ser 2
DC.PR.D\tDundee Corp Pref Ser 3
DF.PR.A\tDividend 15 Split Corp II Prf
DFN.PR.A\tDividend 15 Split Corp
DGS.PR.A\tDividend Growth Split Corp Pref
ECN.PR.A\tEcn Capital Corp Pref Ser A
ECN.PR.C\tEcn Capital Corp Pref Ser C
EFN.PR.A\tElement Fleet Mgmt Corp Pref Ser A
EFN.PR.C\tElement Fleet Mgmt Corp Pref Ser C
EFN.PR.E\tElement Fleet Mgmt Corp Pref Ser E
EFN.PR.I\tElement Fleet Mgmt Corp Pref Ser I
EIT.PR.A\tCanoe Eit Income Fund Pref Ser 1
EIT.PR.B\tCanoe Eit Income Fund Pref Ser 2
ELF.PR.F\tE-L Financial Corp Ltd Pr Ser. 1
ELF.PR.G\tE- L Financial Corp Limited
ELF.PR.H\tE - L Financial Corp Ltd Pref Ser 3
EMA.PR.A\tEmera Inc Series A Pref
EMA.PR.B\tEmera Inc Pref Sh Series B
EMA.PR.C\tEmera Inc Pref Sh Series C
EMA.PR.E\tEmera Inc Pref Ser E
EMA.PR.F\tEmera Inc Series F Pref
EMA.PR.H\tEmera Inc Pref Series H
EMA.PR.J\tEmera Inc.
ENB.PR.A\tEnbridge Pr
ENB.PR.B\tEnbridge Inc Cum Redeem Pref Ser B
ENB.PR.C\tEnbridge Inc Pref Ser C
ENB.PR.D\tEnbridge Inc Pref Ser D
ENB.PR.F\tEnbridge Inc Pref Ser F
ENB.PR.H\tEnbridge Inc Pref Ser H
ENB.PR.J\tEnbridge Inc Pref Ser 7
ENB.PR.N\tEnbridge Inc Pref Ser N
ENB.PR.P\tEnbridge Inc Pref Ser P
ENB.PR.T\tEnbridge Inc Pref Ser R
ENB.PR.U\tEnbridge Inc Pref Sh Series J
ENB.PR.V\tEnbridge Inc Pref Ser 1
ENB.PR.Y\tEnbridge Inc Cum Red Pref Ser 3
ENS.PR.A\tE Split Corp Pref Shares
EQB.PR.C\tEquitable Group Inc Pref Ser 3
FFH.PR.C\tFairfax Fncl Holdings Ltd Pref Ser C
FFH.PR.D\tFairfax Fncl Holdings Ltd Pref Ser D
FFH.PR.E\tFairfax Financial Hldngs Pref Ser E
FFH.PR.F\tFairfax Financial Holdings Pref Ser F
FFH.PR.G\tFairfax Financial Hldngs Pref Ser G
FFH.PR.H\tFairfax Fncl Holdings Ltd Pref Ser H
FFH.PR.I\tFairfax Financial Holdings Series I Pref
FFH.PR.J\tFairfax Fncl Holdings Ltd Pref Ser J
FFH.PR.K\tFairfax Financial Holdings Pref Ser K
FFH.PR.M\tFairfax Financial Holdings Pref Ser M
FFN.PR.A\tNorth American Fin 15 Split Corp Pref
FN.PR.A\tFirst National Financial Corp Pref A
FN.PR.B\tFirst National Financial Corp Pref B
FTN.PR.A\tFinancial 15 Split Corp
FTS.PR.F\tFortis Inc Pref Shares Series F
FTS.PR.G\tFortis Inc First Pref Ser G
FTS.PR.H\tFortis Inc Pref Ser H
FTS.PR.I\tFortis Inc Pref Ser I
FTS.PR.J\tFortis Inc Pref Ser J
FTS.PR.K\tFortis Inc Pref Ser K
FTS.PR.M\tFortis Inc Pref Ser M
FTU.PR.B\tUS Finl 15 Split 2012 Pref Sh
GDV.PR.A\tGlobal Dividend Growth Split Corp Pref A
GWO.PR.F\tGreat-West Lifeco Inc
GWO.PR.G\tGreat-West Lifeco Inc Pr. G
GWO.PR.H\tGreat-West Lifeco Inc 4.85 % Pr.Ser H
GWO.PR.I\tGreat-West Lifeco Inc Prf Series I
GWO.PR.L\tGreat-West Lifeco Inc Pref Ser L
GWO.PR.M\tGreat West Lifeco Pref Ser M
GWO.PR.N\tGreat West Lifeco Inc Pref Srs N
GWO.PR.P\tGreat West Lifeco Inc 5.4 Pct Pref Sh
GWO.PR.Q\tGreat West Lifeco Pref Ser Q
GWO.PR.R\tGreat West Lifeco Inc Ser R
GWO.PR.S\tGreat West Lifeco Pref Ser S
GWO.PR.T\tGreat West Lifeco Pref Ser T
IAF.PR.B\tIndustrial Alliance Cl A Pref Ser B
IAF.PR.G\tIndustrial Alliance Cl A Pref Ser G
IAF.PR.I\tIndustrial Alliance Cl A Pref Ser I
IFC.PR.A\tIntact Financial Corp Pref Cl A
IFC.PR.C\tIntact Financial Corp Pref Cl A
IFC.PR.D\tIntact Financial Corp Pref Shares Ser 4
IFC.PR.E\tIntact Financial Corp Pref Cl A Ser 5
IFC.PR.F\tIntact Financial Corp Pref Shares Ser 6
IFC.PR.G\tIntact Financial Corp Pref Shares Ser 7
IFC.PR.I\tIntact Financial Corp Pref Shares Ser 9
INE.PR.A\tInnergex Renewable Energy Pref Ser A
INE.PR.C\tInnergex Renewable Energy Inc Pref Ser C
L.PR.B\tLoblaw Companies Ltd 2nd Pref Ser B
LB.PR.H\tLaurentian Bank of Cda Pr Ser 13
LBS.PR.A\tLife & Banc Split Corp
LCS.PR.A\tBrompton Lifeco Split Corp Pref Shares
LFE.PR.B\tCanadian Life Split 2012 Pref Sh
MFC.PR.B\tManulife Financial Cl A Pref Ser 2
MFC.PR.C\tManulife Financial Cl A Pref Ser 3
MFC.PR.F\tManulife Financial Cl 1 Sh Ser 3
MFC.PR.G\tManulife Financial Non Cum Cla 1 Ser 5
MFC.PR.H\tManulife Financial Pref Ser 7
MFC.PR.I\tManulife Financial Pref Ser 9
MFC.PR.J\tManulife Financial Class 1 Ser 11
MFC.PR.K\tManulife Financial Pref Ser 13
MFC.PR.L\tManulife Financial Pref Ser 15
MFC.PR.M\tManulife Financial Pref Ser 17
MFC.PR.N\tManulife Financial Pref Ser 19
MFC.PR.P\tManulife Financial Class 1 Sh Ser 4
MFC.PR.Q\tManulife Financial Corp Pref Series 25
MFC.PR.R\tManulife Financial Pref Ser 23
MIC.PR.A\tSagen MI Canada Inc
NA.PR.A\tNational Bank Pref Ser 36
NA.PR.C\tNational Bank Pref Ser 38
NA.PR.E\tNational Bank Pref Series 40
NA.PR.G\tNational Bank Pref Series 42
NA.PR.S\tNational Bank Pref Ser 30
NA.PR.W\tNational Bank Pref Ser 32
NPI.PR.A\tNorthland Power Pref Equity Inc
NPI.PR.B\tNorthland Power Inc Pref Ser 2
NPI.PR.C\tNorthland Power Inc Pref Ser 3
OSP.PR.A\tBrompton Oil Split Corp Pref
PDV.PR.A\tPrime Dividend Corp Pref
PIC.PR.A\tPremium Income Pr
POW.PR.A\tPower Corp A Pr
POW.PR.B\tPower Corp Pref Shares Series B
POW.PR.C\tPower Corp of Canada 5.80%
POW.PR.D\tPower Corp Non-Cum 1st Pfd Shs Ser D
POW.PR.G\tPower Corp of Canada 5.60 Pct Pref Ser G
PPL.PR.A\tPembina Pipeline Corp Pref Class A
PPL.PR.C\tPembina Pipeline Corp Pref Ser 3
PPL.PR.E\tPembina Pipeline Corp Pref Ser 5
PPL.PR.G\tPembina Pipeline Corp Pref Ser 7
PPL.PR.I\tPembina Pipeline Corp Pref Ser 9
PPL.PR.O\tPembina Pipeline Corp Pref Series 15
PPL.PR.Q\tPembina Pipeline Corp Pref Series 17
PPL.PR.S\tPembina Pipeline Corp Pref Series 19
PRM.PR.A\tBig Pharma Split Corp Pref Shares
PVS.PR.F\tPartners Value Split Corp Pref Ser 8
PVS.PR.G\tPartners Value Split Corp
PVS.PR.H\tPartners Value Split Corp Pref Ser 10
PVS.PR.I\tPartners Value Split Corp Pref Series 11
PVS.PR.J\tPartners Value Split Corp
PWF.PR.A\tPower Fin Ser A Pr
PWF.PR.E\tPower Fin Ser D Pr
PWF.PR.F\tPower Financial Corp Pref Ser E
PWF.PR.G\tPower Financial Corp 5.90% Pr Series F
PWF.PR.H\tPower Financial Corp 5.75% Pr Series H
PWF.PR.I\tPower Financial Corp 6% Series I
PWF.PR.K\tPower Fin Corp 4.95% Ser K
PWF.PR.L\tPower Financial Corp Series L Pfd
PWF.PR.O\tPower Financial Corp 5.80 Pref Ser O
PWF.PR.P\tPwr Fnl Corp 4.40 Non Cumul Pref Ser P
PWF.PR.Q\tPower Fin Corp 4.40 Pct Pref Ser Q
PWF.PR.R\tPower Financial Corp 5.5 Pct Pref Ser R
PWF.PR.S\tPower Financial Corp Pref Ser S
PWF.PR.T\tPower Financial Corp 4.20 Pct Pref Ser T
PWF.PR.Z\tPower Financial Corp 5.15 Pct Pref Ser V
PWI.PR.A\tSustainable Power Infra Split Corp Pr A
RCG.PR.B\tRF Capital Group Inc Pref B
RS.PR.A\tReal Estate & E-Commerce Split Corp
RY.PR.H\tRoyal Bank Pref Ser Bb
RY.PR.J\tRoyal Bank Pref Ser Bd
RY.PR.M\tRoyal Bank Pref Ser Bf
RY.PR.N\tRoyal Bank Pref Ser Bh
RY.PR.O\tRoyal Bank Pref Ser Bi
RY.PR.P\tRoyal Bank Pref Ser Bj
RY.PR.R\tRoyal Bank Pref Ser Bm
RY.PR.S\tRBC Pref Shares Series Bo
RY.PR.Z\tRBC First Pref Sh Series AZ
SBC.PR.A\tBrompton Split Banc Corp Pref
SBN.PR.A\tS Split Corp Pref A
SLF.PR.A\tSun Life Pref Ser 1
SLF.PR.B\tSun Life Pref Ser 2
SLF.PR.C\tSun Life Pref Ser 3
SLF.PR.D\tSun Life Pref Ser 4
SLF.PR.E\tSun Life Pref Ser 5
SLF.PR.G\tSun Life Pref Ser 8R
SLF.PR.H\tSun Life Pref Ser H
SLF.PR.I\tSun Life Pref Ser 12R
SLF.PR.J\tSun Life Pref Ser 9Qr
SLF.PR.K\tSun Life Pref Ser 11Qr
TA.PR.D\tTransalta Corp Prfd Series A
TA.PR.E\tTransalta Corp Pref Ser B
TA.PR.F\tTransalta Corp Pref Ser C
TA.PR.H\tTransalta Corp Pref Sh Series E
TA.PR.J\tTransalta Corp Pref Ser G
TRI.PR.B\tThomson Reuters Corporation Prf Srs 2
TRP.PR.A\tTranscanada Corp Pref Ser 1
TRP.PR.B\tTranscanada Corp Pref Ser 3
TRP.PR.C\tTranscanada Corp Pref Ser 5
TRP.PR.D\tTranscanada Corp Pref Ser 7
TRP.PR.E\tTranscanada Corp Pref Ser 9
TRP.PR.F\tTranscanada Corp Pref Ser 2
TRP.PR.G\tTranscanada Corp Pref Ser 11
TRP.PR.H\tTranscanada Corp Pref Ser 4
TRP.PR.I\tTranscanada Corp Pref Ser 6
TRP.PR.K\tTranscanada Corp Pref Ser 15
TXT.PR.A\tTop 10 Split Trust Pref A
VB.PR.A\tVersabank Pref Ser 1
W.PR.M\tWestcoast Energy Inc Pref Ser 12
WFS.PR.A\tWorld Financial Split Corp
WN.PR.A\tGeorge Weston Pref Ser 1
WN.PR.C\tGeorge Weston 5.20% Pref Ser III
WN.PR.D\tGeorge Weston 5.2% Pref Ser IV
WN.PR.E\tGeorge Weston 4.75% Pref Ser V
XMF.PR.B\tM Split Corp Class I Pref Shares
XMF.PR.C\tM Split Corp Class II Pref Shares 2014
XTD.PR.A\tTdb Split Corp Priority Equity Shares
YCM.PR.A\tCommerce Split Corp Class I Pref Shares
YCM.PR.B\tCommerce Split Corp Class II Pref Shares
`
const symJson = symbols.trim().split('\n').map(line=>{
    const [s,d] = line.split('\t')

    return { s, d }
}).filter(({s,d})=>!fs.existsSync(`series/${s}.json`)).reverse()

get()
setInterval(get,172801)

function get() {
    if (symJson.length < 1) {
        debugger
    }
    const {s, d} = symJson.pop()

    getSymbol(s, apikey, d)
}

function getSymbol(sym, apikey, desc) {
    var url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${sym}.to&apikey=${apikey}`;
    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
        if (err) {
            console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {
            // data is successfully parsed as a JSON object:
            data.desc = desc
            fs.writeFileSync(`series/${sym}.json`, JSON.stringify(data,null, 2))
            console.log('wrote',sym,desc)
        }
    });
}
