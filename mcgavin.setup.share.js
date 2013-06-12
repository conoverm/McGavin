//spaces in URLs need to be escaped
sdlmURL     = 'http://prepub.medscape.com/ws/sdlm/gamunex/',

captureFileName = "gamunex.mobile.test.52",

// save in an alternate dir. default = ''; which fails over to: User's home directory and 
//
// default found in sdlmpagecapture function: /Users/mconover/casperjs/mcgavin/
//
// directories need to be unix style -- forward slash (Unix style), not back slash (windows style). '/' is root of current drive. remember trailing slash. '//' is a different drive.
// eg: /Users/mconover/casperjs/mcgavin/
// eg: //NYC2FS/NYC_Group/NYC2_Groups/NYC2FS02/IDT_DEV/Amarin/Main/MLR_Team_Folder/SDLM/SDLM_MLR5_4.9.13/
//
// If no trailing slash then the dirSave and captureFileName will be concatenated: 'mcgavin' + 'vascepa.test' = /mcgavinvascepa.test
//
dirSave     = '';

deskPass    = 0, // set to 1 or true if desk pass is needed.
    topNavCap = 1, // capture topnav links. Dependent on deskPass being on. This is almost universally '1', can be set to '0' mainly for testing purposes.
mobilePass  = 1, // set to 1 or true if mobile pass is needed.

// sdlm
// tk: infosite || banner || alert
// The point of this var was to make mcgavin extensible.
// The var would be sent to a controller script which would call in a product specific capture script.
// It us currently unused.
product = 'sdlm',

// document.body.offsetWidth or offsetHeight for whole page.
// otherwise, integer representing the px. 800 or 650
// Viewport size will still capture entire page
viewPorts = {
    width:1000,
    height:800
},

// use clipRect -- use: [true|1] -- then define the rectangle top start, left start,
// width and height, all in px.
clippingRectangle = {
    use:0,
    top:0,
    left:0,
    width:400,
    height:200
},

timeout = 0,
// .pdf, .png, .jpg, .gif
filetype = '.jpg',
// uAgent for iphone4s: Apple-iPhone4C1/1001.523
uAgent = 'McGavin Screen Agent';