// shooter mcgavin. For capturing each scene of an SDLM and modals.
/* jshint strict:false */
/*global CasperError console phantom require*/
var setup = require('/Users/mconover/casperjs/mcgavin/mcgavin.setup.js');
var casper = require("casper").create({
    // verbose: true,
    // logLevel: "debug"
    viewportSize: {
        width:viewPorts.width,
        height:viewPorts.height
    }
});
    
var allUrls     = [],
    totalScenes = 0,
    defaultdata ='',
    curHash     ='',
    coreIndex   ='';

var topnavIndex = 0;
var topnavArr = [];

casper.userAgent(uAgent);

casper.on('remote.message', function(message) {
    console.log('~RMTCNSL: '+ message);
});

var hashBuilder = function(){
    var j='',
        i='',
        k=1; // Using 'k' to reset the array for mobile and desk passes.

    // this just needs to build the url, not load the page.
    // defatuldata.data.sectionfiles = total number of pages
    // defaultdata.data.grouping.length = total number of chapters
    // defaultdata.data.grouping[n].idx = number of pages per chapter
    // http://localhost/sdlm/pradaxa/core_index.html#content=0_0

    for (i = 0; i<defaultdata.data.grouping.length;i++){
        for (j =0;j<defaultdata.data.grouping[i].idx.length;j++){
            allUrls[k] = '#content='+i+'_'+j;
            k++;
        }
    }
};

var sdlmPageCapture = function(self,link,testThisGetCurrentUrl,i,dOrM,opt){
    opt     = opt || '';
    dOrM    = dOrM || '';
    dirSave = dirSave || '/Users/mconover/casperjs/mcgavin/';
    if (dOrM === 'core_index.html' || dOrM === 'sdlm_index.html') {
        dOrM = 'dsk';
    } else if(dOrM === 'core_index_m.html' || dOrM === 'sdlm_index_m.html') {
        dOrM = 'mbl';
    }

    casper.evaluate(function(){
        document.body.style.background = "#fff";
    });

    // captureFileName, filetype are in mcgavin.setup.js
    casper.capture(dirSave + captureFileName + '/' + captureFileName + '-' + dOrM +'-p' + (i) +'-'+ link.slice(link.length-3,link.length) + opt + filetype );
    casper.echo(dOrM + ' ' + link + opt + ' captured ');
};

var jsonInit = function (whichPass){

    casper.then(function(){
        var defaultJson = '';

        if (whichPass === 'mobi' || whichPass === 'mobile' || whichPass==='m') {
            defaultJson = 'defaultdata_m.json';
        } else if (whichPass==='desk' || whichPass==='desktop' || whichPass==='d') {
            defaultJson = 'defaultdata.json';
        } else if (whichPass===undefined) {
            defaultJson = 'defaultdata.json';
        }

        this.open(sdlmURL+defaultJson,{
            method:'get',
            headers: {
                'Accept':'application/json'
            }
        });

        this.then(function(){ // Loaded JSON url, now does it exist? if it doesn't exit.
            if (!this.resourceExists(sdlmURL+defaultJson)) {
                this.echo('json does not exist for '+whichPass, 'ERROR');
                this.exit();
            }
        });

        this.then(function(){
            defaultdata = JSON.parse(this.getPageContent());
            totalScenes = defaultdata.data.sectionfiles.length; 
            this.echo('Capturing ' + captureFileName +' with '+ totalScenes +' pages.');
        });
    
        this.then( function(){ 
            hashBuilder();
        });
    });

};

casper.then(function(){
    casper.echo('directory to save: '+dirSave + captureFileName);
    if (deskPass){
        this.echo('Desktop pass requested.');
        jsonInit('desk');
        deskCap();
        topNavDsk();
    }
});

casper.then(function(){
    if (mobilePass){
        this.echo('Mobile pass requested.');
        jsonInit('mobi');
        mobileCap();
    }
});

var mobileCap = function(){
    //coreIndex = (casper.resourceExists('core_index_m.html') ? 'core_index_m.html' : 'sdlm_index_m.html');
    coreIndex = 'core_index_m.html';
    casper.then(function(){
        var i = 0;

        casper.each(allUrls, function(self, link) {
            this.thenOpen(sdlmURL+coreIndex+link, function() {
                this.then(function(){ i++; });
                
                var testThisGetCurrentUrl = this.getCurrentUrl().slice(0,sdlmURL.length);
                
                var popSceneHeight = this.evaluate(function(){
                        PSH = $('#popthis #scenecontent').height();
                        return PSH;
                    });

                var uidialogHght = this.evaluate(function(){
                        UIH = $('.ui-dialog').height();
                        return UIH;
                    });
                var uiSceneContHght = this.evaluate(function(){ 
                        UISCH = $('#popthis.ui-dialog-content #scenecontent').height();
                        return UISCH;
                    });

                this.then(function(){
                    if (this.exists('form#loginRequest')) {
                        casper.fill('form#loginRequest', {
                            'userId':logPass.login,
                            'password':logPass.pass
                        }, true);
                    }
                    this.thenOpen(sdlmURL+coreIndex+link);
                });

                this.then(function(){
                    if ( !this.exists('#popthis #cont_button') && !this.exists('#mainmenu')){   // if #popthis #cont_button and #mainmenu are not on the page, leave this function. 
                        return;                                                                 // ergo, this is the 2013 mobile template capture function
                    }
                    this.then(function(){
                        this.viewport(399,1);
                    });


                    // experimental mobile intro page capture NEEDS WORK
                    this.thenEvaluate(function(){
                            // this is all the stuff for mlr_view. 
                            if ($('#popthis #cont_button').length>0){
                                $("#popthis").dialog('close'); // close intro/welcome dialog, 
                            }
                            //$("#maincontent").css('height',''); // remove height from #maincontent, 
                            $("#maincontent").css('height',$('#scenecontent').height()+40); // remove height from #maincontent, 
                            $("#mainmenu").css('height','20px'); // reduce height on menu slide out element. 
                            myJSONconfig.autocontentheightoffset = undefined; // and autocontentoffset, which i don't really know what that does, but it needs to be there.

                    });

                    this.then(function(){
                        sdlmPageCapture(self,link,testThisGetCurrentUrl,i,coreIndex);
                    });

                 });

                this.then(function(){
                    if (!this.exists('#mbuttsul')){ // #mbuttsul is not here, leave. Ergo, we are in the pre-2013 mobile template.
                        return;
                    }
                    var docOffsetHeight = this.evaluate(function(){
                        dof = document.body.offsetHeight;
                        return dof;
                    });

                    var outerHeight2012 = this.evaluate(function(){
                        oh2012 = $('#mobilemenu').outerHeight('true') + $('#tabs').outerHeight('true') + $('#mobiletabs').outerHeight('true');
                        return oh2012;
                    });

                    this.then(function(){
                        this.viewport(399, docOffsetHeight);
                    });

                    this.then(function(){
                        sdlmPageCapture(self,link,testThisGetCurrentUrl,i,coreIndex);
                    });
                });

           
            });
        });
    });
};

var deskCap = function(){
    coreIndex = 'core_index.html';
    casper.then(function(){
        var i = 0;
        casper.each(allUrls, function(self, link) {
            this.thenOpen(sdlmURL+coreIndex+link, function() {
                i++;
                // this block test for the login page.
                var testThisGetCurrentUrl = this.getCurrentUrl().slice(0,sdlmURL.length);
                this.then(function(){
                    if (this.exists('form#loginRequest')) {
                        casper.fill('form#loginRequest', {
                            'userId':logPass.login,
                            'password':logPass.pass
                        }, true);
                    }
                    this.thenOpen(sdlmURL+coreIndex+link);
                });

                this.then(function(){
                    if (this.exists('#fig-inner .fig')){
                        this.click('#fig-inner .fig');
                        this.echo('#fig-inner');
                        this.wait(700);
                        this.then(function(){
                            this.evaluate(function(){
                                document.body.style.background = "#fff";
                            });
                            sdlmPageCapture(self,link,testThisGetCurrentUrl,i,coreIndex,'_fig');
                        });
                    }
                    this.thenOpen(sdlmURL+coreIndex+link);
                });

                this.then(function(){
                    if (this.exists('.stud-pop')){
                        this.click('.stud-pop');
                        this.echo('stud-pop clicked');
                        this.echo('waiting 750');
                        this.wait(750);
                        this.then(function(){
                            this.evaluate(function(){
                                document.body.style.background = "#fff";
                            });
                            sdlmPageCapture(self,link,testThisGetCurrentUrl,i,coreIndex,'_stud');
                        });
                        this.echo('stud-pop captured');
                    }
                    this.thenOpen(sdlmURL+coreIndex+link);
                });
                
                this.then(function(){
                    if (this.exists('#pollwrap .next')){
                        this.echo('2013 poll with .next (possible animation)');
                        this.wait(500);
                    }
                });

                this.then(function(){
                    sdlmPageCapture(self,link,testThisGetCurrentUrl,i,coreIndex);
                });
            });
        });
    });
};
// top nav links capture
// TODO: topNavDsk() to be independent of deskCap()
//
var topNavDsk = function(){
    casper.then(function(){
        if (topNavCap !== 1 ){
            return; // topNavCap is set to something other than true, therefore bail.
        }
        this.then(function(){
            var i = 0;
            this.open(sdlmURL);
            this.wait(500);
            while (this.exists('#topnavitem_'+topnavIndex)){
                topnavArr.push('#topnavitem_'+topnavIndex);
                topnavIndex++;
            }

            this.each(topnavArr, function(self, navitem) {
                this.thenOpen(sdlmURL+coreIndex, function() {
                    this.click(navitem);
                    this.echo('topnav capture: ' + navitem);
                    this.wait(1500);
                    this.evaluate(function(){
                        document.body.style.background = "#fff";
                        if ( $('#popthis').prop('scrollHeight') > $('#popthis').height() ){
                            $('#popthis').css('height','');
                        }
                    });
                    this.then(function() {
                        this.capture('./' + captureFileName + '/d-topnav_'+i+'.jpg');
                    });

                    i++;
                });
            });
        });
    });
};
casper.run();
