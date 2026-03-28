import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users, Play, Pause, ChevronRight, ChevronDown, Zap, Trophy, Sparkles, Volume2,
  Timer, Settings, Maximize2, Radio, Wifi, WifiOff, Clock, Check, X, Lightbulb,
  Search, Moon, Sun, Keyboard, ArrowRight, BarChart3, Send, Tag, AlertCircle,
  Mic, Video, PanelRightClose, PanelRight, CircleDot, VolumeX, SkipForward,
  RotateCcw, Layout, QrCode, MessageSquare, Filter, AlertTriangle, Heart,
  Shield, EyeOff, LogOut, Download, ChevronUp, Trash2, Flag, PauseCircle,
  PlayCircle, Monitor, Smartphone, Signal, SignalHigh, SignalLow, SignalZero,
  Gift, Star, History, XCircle, CheckCircle, Copy, ExternalLink, Bell, BellOff,
  Maximize, Lock, Unlock, Hand, ThumbsUp, MessageCircle, Plus, RefreshCw
} from "lucide-react";

/*  COCKPIT BANLIEUWOOD V6 - FULL ENHANCEMENTS: ALL WIDGET OPTIONS IMPLEMENTED */

const themes = {
  dark: {
    bg:"#0c0c18",surface:"#13132a",surfaceAlt:"#1a1a35",card:"#161633",
    border:"#2a2a50",accent:"#8b5cf6",accentLight:"#c4b5fd",accentDim:"#8b5cf622",
    gold:"#fbbf24",green:"#34d399",red:"#f87171",pink:"#f472b6",orange:"#fb923c",cyan:"#22d3ee",
    text:"#f0f0f8",textSec:"#94a3b8",textMut:"#64748b",skel:"#1e1e3a",
  },
  light: {
    bg:"#f8f9fc",surface:"#ffffff",surfaceAlt:"#f1f5f9",card:"#ffffff",
    border:"#e2e8f0",accent:"#7c3aed",accentLight:"#8b5cf6",accentDim:"#7c3aed11",
    gold:"#d97706",green:"#059669",red:"#dc2626",pink:"#db2777",orange:"#ea580c",cyan:"#0891b2",
    text:"#1e293b",textSec:"#475569",textMut:"#94a3b8",skel:"#e2e8f0",
  },
};

const LEVELS = [
  {name:"Figurant",min:0,max:150,icon:"🎭",color:"#94a3b8"},
  {name:"Technicien",min:150,max:300,icon:"🎛️",color:"#34d399"},
  {name:"Assistant",min:300,max:450,icon:"📋",color:"#8b5cf6"},
  {name:"Realisateur",min:450,max:600,icon:"🎬",color:"#fbbf24"},
];
const getLevel = function(xp) {
  return LEVELS.find(function(l){ return xp >= l.min && xp < l.max; }) || LEVELS[3];
};

const FORMULES = [
  {id:"f0",name:"F0 - Decouverte",duration:"1h",sessions:1},
  {id:"f1",name:"F1 - Legere",duration:"3h",sessions:3},
  {id:"f2",name:"F2 - Complete",duration:"8h",sessions:8},
];

const CLASSES = [
  {id:"4b",name:"4e B",school:"College Jean Moulin",count:25,lastSessionDate:"2026-03-20"},
  {id:"3a",name:"3e A",school:"College Jean Moulin",count:28,lastSessionDate:"2026-03-15"},
  {id:"6c",name:"6e C",school:"College Rosa Parks",count:22,lastSessionDate:null},
];

const MODULES = [
  {id:"p1",phase:1,name:"Ideation",icon:"💡",color:"#8b5cf6"},
  {id:"p2",phase:2,name:"Ecriture",icon:"✏️",color:"#34d399"},
  {id:"p3",phase:3,name:"Decouverte",icon:"🎬",color:"#fbbf24"},
  {id:"p4",phase:4,name:"Tournage",icon:"🎥",color:"#f87171"},
  {id:"p5",phase:5,name:"Vote Final",icon:"🏆",color:"#fbbf24"},
  {id:"p6",phase:6,name:"Montage",icon:"✂️",color:"#f472b6"},
  {id:"p7",phase:7,name:"Projection",icon:"🎬️",color:"#22d3ee"},
  {id:"p8",phase:8,name:"Festival",icon:"⭐",color:"#fbbf24"},
];

const VOTE_OPTS = [
  {id:1,text:"Enquete au college",emoji:"🔍",votes:12},
  {id:2,text:"Le cinema du futur",emoji:"🚀",votes:5},
  {id:3,text:"Seuls dans la foret",emoji:"🌲",votes:4},
  {id:4,text:"La danse des ombres",emoji:"💃",votes:3},
];

const MANCHE_HISTORY = [
  {round:1,eliminated:"Le cinema du futur",pct:8,winner:"Enquete au college",winPct:35},
  {round:2,eliminated:"Seuls dans la foret",pct:12,winner:"Enquete au college",winPct:38},
];

const QUIZ_DATA = [
  {id:1,question:"Quel est le role du realisateur ?",options:["Diriger les acteurs","Ecrire le scenario","Filmer","Monter le film"],correct:0,responses:[12,5,3,2]},
  {id:2,question:"Qu'est-ce qu'un plan sequence ?",options:["Un plan court","Un plan sans coupure","Un plan large","Un gros plan"],correct:1,responses:[3,15,4,1]},
  {id:3,question:"Quel angle cree une impression de puissance ?",options:["Plongee","Contre-plongee","Vue de face","Plan aerien"],correct:1,responses:[6,11,3,3]},
];

const IMAGE_STIMULI = [
  {id:1,title:"Scene de rue",desc:"Observez les emotions des personnages",reactions:["Tristesse","Solitude","Espoir","Courage"],studentReactions:[{name:"Rayan J.",text:"Je vois de l'espoir dans le regard"},{name:"Amina G.",text:"La lumiere montre la solitude"},{name:"Ines B.",text:"Le cadrage isole le personnage"}]},
  {id:2,title:"Cour d'ecole",desc:"Imaginez une scene de film ici",reactions:["Joie","Tension","Nostalgie","Amitie"],studentReactions:[{name:"Lea C.",text:"Ca pourrait etre une scene de comedie"},{name:"Fatou D.",text:"L'ambiance est nostalgique"}]},
];

const WRITING_PROMPTS = [
  {id:1,prompt:"Decrivez votre heros en 3 phrases",responses:[{name:"Rayan J.",text:"Mon heros est un ado du quartier qui reve de cinema. Il est courageux mais timide."},{name:"Amina G.",text:"C'est une fille qui decouvre un vieux projecteur magique."}]},
  {id:2,prompt:"Ecrivez la scene d'ouverture (5 lignes max)",responses:[{name:"Ines B.",text:"Plan large sur la cite. On entend de la musique au loin. Un ado marche seul."},{name:"Bilal T.",text:"Nuit. Un gymnase vide. Des pas resonnent."}]},
];

const PITCH_DATA = [
  {id:1,student:"Rayan J.",title:"Le Regard du Quartier",status:"done",rating:4.2},
  {id:2,student:"Amina G.",title:"Lumiere Cachee",status:"done",rating:3.8},
  {id:3,student:"Ines B.",title:"Coupez !",status:"current",rating:null},
  {id:4,student:"Bilal T.",title:"Action !",status:"waiting",rating:null},
];

const SCENARIO_SCENES = [
  {id:1,title:"Scene 1: L'arrivee",validated:true,writers:["Rayan J.","Amina G."],text:"Plan large. Le heros arrive au college."},
  {id:2,title:"Scene 2: La decouverte",validated:true,writers:["Ines B.","Lea C."],text:"INT. Salle de classe. Le heros trouve un objet."},
  {id:3,title:"Scene 3: Le conflit",validated:false,writers:["Bilal T.","Fatou D."],text:"EXT. Cour. Confrontation."},
  {id:4,title:"Scene 4: Le climax",validated:false,writers:[],text:""},
];

const TEAM_ROLES = [
  {role:"Realisateur",icon:"🎬",assigned:"Rayan J."},
  {role:"Cadreur",icon:"📷",assigned:"Amina G."},
  {role:"Ingenieur Son",icon:"🎙️",assigned:"Bilal T."},
  {role:"Scenariste",icon:"✏️",assigned:"Ines B."},
  {role:"Monteur",icon:"✂️",assigned:null},
  {role:"Dir. Artistique",icon:"🎨",assigned:null},
];

var STORYBOARD_FRAMES = [
  {id:1,scene:"Plan 1",angle:"Plongee",movement:"Fixe",desc:"Vue du college depuis le toit",validated:true},
  {id:2,scene:"Plan 2",angle:"Normal",movement:"Travelling",desc:"Le heros marche dans le couloir",validated:true},
  {id:3,scene:"Plan 3",angle:"Contre-plongee",movement:"Panoramique",desc:"Le heros leve les yeux vers le ciel",validated:false},
  {id:4,scene:"Plan 4",angle:"Gros plan",movement:"Fixe",desc:"Visage du heros, emotion de surprise",validated:false},
  {id:5,scene:"Plan 5",angle:"Plan large",movement:"Dolly",desc:"La cour vide, ambiance mystere",validated:false},
  {id:6,scene:"Plan 6",angle:"Normal",movement:"Steadicam",desc:"Course-poursuite dans les escaliers",validated:false},
];

var ALL_RESPONSES = [
  {id:1,student:"Rayan J.",text:"Le heros devrait etre un ado du quartier",phase:"P1",time:"14:02",status:"validated",starred:false},
  {id:2,student:"Amina G.",text:"On pourrait filmer au parc",phase:"P1",time:"14:03",status:"validated",starred:true},
  {id:3,student:"Ines B.",text:"Je propose un twist a la fin",phase:"P2",time:"14:05",status:"pending",starred:false},
  {id:4,student:"Lea C.",text:"Et si c'etait une comedie ?",phase:"P1",time:"14:06",status:"pending",starred:false},
  {id:5,student:"Sofia M.",text:"Le scenario manque de suspense",phase:"P2",time:"14:08",status:"flagged",starred:false},
  {id:6,student:"Fatou D.",text:"La musique est trop importante",phase:"P2",time:"14:10",status:"validated",starred:true},
  {id:7,student:"Bilal T.",text:"Le mechant devrait avoir un masque",phase:"P1",time:"14:11",status:"pending",starred:false},
];

var MODULE_OBJECTIVES = [
  "Stimuler la creativite et collecter les idees",
  "Structurer les idees en texte narratif",
  "Decouvrir les bases du langage cinematographique",
  "Realiser les prises de vue et le son",
  "Voter pour les meilleures propositions",
  "Assembler et monter les sequences",
  "Projeter et critiquer le film",
  "Celebrer et distribuer les roles finaux",
];

var MODULE_PROGRESS = [100, 75, 40, 0, 0, 0, 0, 0];

var SESSION_STATS = {
  totalResponses: 47,
  avgEngagement: 82,
  topContributor: "Rayan J.",
  bestStreak: 8,
  modulesCompleted: 2,
};

var NOTE_TAGS = [
  {id:"obs",label:"Observation",color:"#8b5cf6"},
  {id:"rev",label:"A revoir",color:"#f87171"},
  {id:"comp",label:"Comportement",color:"#fb923c"},
  {id:"idee",label:"Idee",color:"#34d399"},
];

const mkStudent = function(id, name, avatar, status, xp, streak, responding, tags, lastResponse, handRaised) {
  return {
    id: id, name: name, avatar: avatar, status: status, xp: xp, streak: streak,
    responding: responding, tags: tags, level: getLevel(xp), lastResponse: lastResponse,
    hasError: status === "disconnected", idleSince: status === "idle" ? Date.now() - 180000 : null,
    reconnects: status === "disconnected" ? 2 : 0, handRaised: handRaised || false,
  };
};

const STUDENTS = [
  mkStudent(1,"Rayan J.","🧑‍🎤","active",342,6,true,["leader"],"Le heros devrait etre un ado du quartier",true),
  mkStudent(2,"Amina G.","👩‍🎓","active",289,8,true,["creative"],"On pourrait filmer au parc",false),
  mkStudent(3,"Bilal T.","👨‍🎨","active",412,3,false,["leader"],"Le mechant devrait avoir un masque",false),
  mkStudent(4,"Lea C.","👧","active",198,2,true,[],"Et si c'etait une comedie ?",true),
  mkStudent(5,"Ibrahim N.","👦","idle",156,0,false,[],null,false),
  mkStudent(6,"Fatou D.","👩","active",267,4,true,["creative"],"La musique est trop importante",false),
  mkStudent(7,"Mehdi R.","👨","active",345,5,false,[],null,false),
  mkStudent(8,"Yasmine K.","👧‍🎤","active",198,1,false,[],null,false),
  mkStudent(9,"Theo P.","👨‍💻","disconnected",89,0,false,[],null,false),
  mkStudent(10,"Sofia M.","👩‍🎨","active",234,3,true,[],"Le scenario manque de suspense",true),
  mkStudent(11,"Noah H.","👦‍🎤","disconnected",45,0,false,[],null,false),
  mkStudent(12,"Ines B.","👧","active",312,7,true,["creative"],"Je propose un twist a la fin",false),
  mkStudent(13,"Youssef V.","👨","idle",123,0,false,[],null,false),
  mkStudent(14,"Camille F.","👩","active",278,4,true,[],"Le decor du gymnase serait parfait",false),
  mkStudent(15,"Adam L.","👦","active",189,2,false,[],null,false),
  mkStudent(16,"Nour S.","👧‍🎓","active",356,5,true,["leader"],"On devrait voter pour le genre d'abord",false),
  mkStudent(17,"Lucas W.","👨","active",167,1,false,[],null,false),
  mkStudent(18,"Aisha T.","👩","idle",134,0,false,[],null,false),
  mkStudent(19,"Enzo D.","👦","active",223,3,true,[],"Action !",false),
  mkStudent(20,"Maryam H.","👧","active",298,4,true,[],"Le costume du heros devrait etre bleu",false),
  mkStudent(21,"Ryan K.","👨","active",178,2,false,[],null,false),
  mkStudent(22,"Lina P.","👩‍🎨","active",245,3,true,["creative"],"Et si on faisait un flashback ?",false),
  mkStudent(23,"Omar G.","👦","active",156,1,false,[],null,false),
  mkStudent(24,"Emma R.","👧","active",201,2,true,[],"La scene d'ouverture doit etre forte",false),
  mkStudent(25,"Karim Z.","👨‍🎤","active",267,4,false,["leader"],null,false),
];

/* Tooltip */
function Tip(props) {
  var stateS = useState(false);
  var s = stateS[0];
  var setS = stateS[1];
  return (
    React.createElement("span", {style:{position:"relative",display:"inline-flex"},onMouseEnter:function(){setS(true);},onMouseLeave:function(){setS(false);}},
      props.children,
      s && React.createElement("span", {role:"tooltip",style:{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",padding:"6px 12px",borderRadius:8,background:"#1e293b",color:"#f0f0f8",fontSize:11,fontWeight:500,whiteSpace:"nowrap",zIndex:999,boxShadow:"0 4px 12px #00000044",pointerEvents:"none"}},
        props.text,
        React.createElement("span", {style:{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",border:"5px solid transparent",borderTopColor:"#1e293b"}})
      )
    )
  );
}

/* Animated number */
function AnimN(props) {
  var v = props.value;
  var d = props.d || 800;
  var dispState = useState(0);
  var disp = dispState[0];
  var setD = dispState[1];
  var r = useRef(null);
  useEffect(function(){
    var s = disp, diff = v - s;
    if (!diff) return;
    var st = performance.now();
    var a = function(now) {
      var p = Math.min((now - st) / d, 1);
      setD(Math.round(s + diff * (1 - Math.pow(1 - p, 3))));
      if (p < 1) r.current = requestAnimationFrame(a);
    };
    r.current = requestAnimationFrame(a);
    return function(){ cancelAnimationFrame(r.current); };
  }, [v]);
  return React.createElement(React.Fragment, null, disp);
}

/* Message Modal Body */
function MsgModalBody(props) {
  var T = props.T;
  var student = STUDENTS.find(function(x){ return x.id === props.studentId; });
  var isEncourage = props.type === "encourage";
  var msgs = isEncourage
    ? ["Super contribution ! 👏","Continue comme ca ! ⭐","Tres bonne idee ! 💡","Bravo pour ta participation ! 🎬"]
    : ["On attend ta reponse 😊","N'oublie pas de voter !","Besoin d'aide ? Leve la main","Tu peux y arriver ! 💪"];
  return React.createElement(React.Fragment, null,
    React.createElement("div", {style:{display:"flex",alignItems:"center",gap:10,marginBottom:16}},
      React.createElement("span", {style:{fontSize:28}}, student ? student.avatar : ""),
      React.createElement("div", null,
        React.createElement("div", {style:{fontSize:15,fontWeight:700}}, student ? student.name : ""),
        React.createElement("div", {style:{fontSize:12,color:T.textMut}}, isEncourage ? "Envoyer un encouragement" : "Envoyer un rappel")
      )
    ),
    React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:6,marginBottom:16}},
      msgs.map(function(msg, i) {
        return React.createElement("button", {key:i,onClick:function(){ props.onSend(student ? student.name : "", isEncourage ? "💚" : "🔔"); },style:{border:"none",cursor:"pointer",fontFamily:"inherit",padding:"10px 14px",borderRadius:10,borderWidth:1,borderStyle:"solid",borderColor:T.border,background:T.surfaceAlt,color:T.text,fontSize:13,textAlign:"left",width:"100%"}},
          msg
        );
      })
    ),
    React.createElement("button", {onClick:props.onClose,style:{border:"none",cursor:"pointer",fontFamily:"inherit",width:"100%",padding:"10px",borderRadius:10,borderWidth:1,borderStyle:"solid",borderColor:T.border,background:"transparent",color:T.textMut,fontSize:12}},
      "Annuler"
    )
  );
}

/* Module Content Component */
function ModuleContent(props) {
  var T = props.T;
  var mod = props.mod;
  var currentImageIdx = props.currentImageIdx;
  var onImageNext = props.onImageNext;
  var onImagePrev = props.onImagePrev;
  var currentQuizIdx = props.currentQuizIdx;
  var onQuizNext = props.onQuizNext;
  var voteData = props.voteData;
  var totalVotes = props.totalVotes;
  var sorted = props.sorted;

  if (mod.phase === 1) {
    var img = IMAGE_STIMULI[currentImageIdx];
    var reactionCounts = [12, 8, 5, 3];
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        React.createElement("h3", {style:{fontSize:14,fontWeight:700}}, "Image Stimulus: " + img.title),
        React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8}},
          React.createElement("span", {style:{fontSize:11,color:T.textMut,padding:"4px 10px",borderRadius:8,background:T.surfaceAlt}}, img.studentReactions.length + "/25 ont reagi"),
          React.createElement("button", {onClick:function(){if (props.onProject) props.onProject("image");},style:{border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,background:T.accent,color:"#fff",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
            React.createElement(Monitor, {size:12}),
            "Projeter"
          )
        )
      ),
      React.createElement("div", {style:{marginBottom:20}},
        React.createElement("div", {style:{width:"100%",height:200,borderRadius:12,background:"linear-gradient(135deg," + T.accent + "," + T.pink + ")",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:48}}, "🖼️"),
        React.createElement("p", {style:{fontSize:13,color:T.textSec,marginBottom:12}}, img.desc),
        React.createElement("div", {style:{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}},
          img.reactions.map(function(r, i) {
            return React.createElement("span", {key:i,style:{padding:"4px 10px",borderRadius:20,background:T.accent + "15",color:T.accent,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
              r,
              React.createElement("span", {style:{background:T.accent + "30",padding:"1px 6px",borderRadius:10,fontSize:9,fontWeight:700}}, reactionCounts[i] || 0)
            );
          })
        ),
        React.createElement("div", {style:{marginBottom:12}},
          img.studentReactions.map(function(sr, i) {
            return React.createElement("div", {key:i,style:{padding:10,borderRadius:8,background:T.surfaceAlt,marginBottom:8,fontSize:11,borderLeft:"3px solid " + T.accent}},
              React.createElement("div", {style:{fontWeight:700,marginBottom:2}}, sr.name),
              React.createElement("div", {style:{color:T.textSec}}, sr.text)
            );
          })
        )
      ),
      React.createElement("div", {style:{display:"flex",gap:8}},
        currentImageIdx > 0 && React.createElement("button", {onClick:onImagePrev,style:{border:"none",cursor:"pointer",padding:"8px 12px",borderRadius:10,background:T.surfaceAlt,color:T.text,fontSize:12,fontWeight:600}}, "Precedent"),
        currentImageIdx < IMAGE_STIMULI.length - 1 && React.createElement("button", {onClick:onImageNext,style:{border:"none",cursor:"pointer",padding:"8px 12px",borderRadius:10,background:T.accent,color:"#fff",fontSize:12,fontWeight:600}}, "Suivant"),
        React.createElement("span", {style:{fontSize:11,color:T.textMut,alignSelf:"center",marginLeft:"auto"}}, (currentImageIdx + 1) + "/" + IMAGE_STIMULI.length + " images")
      )
    );
  }

  if (mod.phase === 2) {
    var promptIdx = props.currentPromptIdx || 0;
    var prompt = WRITING_PROMPTS[promptIdx];
    var respCount = prompt.responses.length;
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        React.createElement("h3", {style:{fontSize:14,fontWeight:700}}, "Prompt: " + prompt.prompt),
        React.createElement("div", {style:{display:"flex",gap:6,alignItems:"center"}},
          React.createElement("span", {style:{fontSize:11,padding:"4px 10px",borderRadius:8,background:T.green + "15",color:T.green,fontWeight:600}}, respCount + "/25 ont repondu"),
          React.createElement("button", {onClick:function(){if (props.onProject) props.onProject("writing");},style:{border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,background:T.accent,color:"#fff",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
            React.createElement(Monitor, {size:12}),
            "Projeter"
          )
        )
      ),
      React.createElement("div", {style:{width:"100%",height:6,borderRadius:3,background:T.surfaceAlt,marginBottom:12,overflow:"hidden"}},
        React.createElement("div", {style:{height:"100%",width:Math.round((respCount / 25) * 100) + "%",background:T.green,borderRadius:3,transition:"width 0.3s ease"}})
      ),
      React.createElement("div", {style:{display:"flex",gap:6,alignItems:"center",marginBottom:12}},
        React.createElement("span", {style:{fontSize:10,color:T.textMut,animation:"shimmer 1.5s ease infinite"}}, "3 eleves ecrivent en ce moment..."),
        React.createElement("span", {style:{width:6,height:6,borderRadius:"50%",background:T.green,animation:"pulse2 2s ease infinite"}})
      ),
      prompt.responses.map(function(resp, i) {
        return React.createElement("div", {key:i,style:{padding:12,borderRadius:10,background:T.card,border:"1px solid " + T.border,marginBottom:8}},
          React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}},
            React.createElement("span", {style:{fontWeight:700,fontSize:12}}, resp.name),
            React.createElement("div", {style:{display:"flex",gap:4}},
              React.createElement("button", {style:{border:"none",cursor:"pointer",width:24,height:24,borderRadius:6,background:T.green + "15",color:T.green,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"},title:"Valider"}, "✅"),
              React.createElement("button", {style:{border:"none",cursor:"pointer",width:24,height:24,borderRadius:6,background:T.gold + "15",color:T.gold,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"},title:"Favori"}, "⭐"),
              React.createElement("button", {onClick:function(){if (props.onProject) props.onProject("writing");},style:{border:"none",cursor:"pointer",width:24,height:24,borderRadius:6,background:T.accent + "15",color:T.accent,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"},title:"Projeter cette reponse"}, "📽️")
            )
          ),
          React.createElement("div", {style:{fontSize:11,color:T.textSec,lineHeight:1.5}}, resp.text),
          React.createElement("div", {style:{fontSize:9,color:T.textMut,marginTop:4}}, "Longueur: " + resp.text.length + " caracteres")
        );
      }),
      React.createElement("div", {style:{display:"flex",gap:8,marginTop:8}},
        promptIdx > 0 && React.createElement("button", {onClick:function(){if (props.onPromptPrev) props.onPromptPrev();},style:{border:"none",cursor:"pointer",padding:"8px 12px",borderRadius:10,background:T.surfaceAlt,color:T.text,fontSize:12,fontWeight:600}}, "Prompt precedent"),
        promptIdx < WRITING_PROMPTS.length - 1 && React.createElement("button", {onClick:function(){if (props.onPromptNext) props.onPromptNext();},style:{border:"none",cursor:"pointer",padding:"8px 12px",borderRadius:10,background:T.accent,color:"#fff",fontSize:12,fontWeight:600}}, "Prompt suivant"),
        React.createElement("span", {style:{fontSize:11,color:T.textMut,alignSelf:"center",marginLeft:"auto"}}, (promptIdx + 1) + "/" + WRITING_PROMPTS.length + " prompts")
      )
    );
  }

  if (mod.phase === 3) {
    var quiz = QUIZ_DATA[currentQuizIdx];
    var totalResp = quiz.responses.reduce(function(a, b) { return a + b; }, 0);
    var correctResp = quiz.responses[quiz.correct];
    var successRate = totalResp > 0 ? Math.round((correctResp / totalResp) * 100) : 0;
    var qTimer = props.quizTimer || 30;
    var qRevealed = props.quizRevealed || false;
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        React.createElement("div", {style:{display:"flex",alignItems:"center",gap:10}},
          React.createElement("span", {style:{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:8,background:T.accent + "15",color:T.accent}}, (currentQuizIdx + 1) + "/" + QUIZ_DATA.length),
          React.createElement("h3", {style:{fontSize:14,fontWeight:700,margin:0}}, quiz.question)
        ),
        React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8}},
          React.createElement("span", {style:{fontFamily:"monospace",fontSize:16,fontWeight:900,color:qTimer < 10 ? T.red : T.accent,padding:"4px 10px",borderRadius:8,background:qTimer < 10 ? T.red + "15" : T.accent + "10"}}, qTimer + "s"),
          React.createElement("button", {onClick:function(){if (props.onProject) props.onProject("quiz");},style:{border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,background:T.accent,color:"#fff",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
            React.createElement(Monitor, {size:12}),
            "Projeter"
          )
        )
      ),
      React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:8,marginBottom:16}},
        quiz.options.map(function(opt, i) {
          var pct = totalResp > 0 ? Math.round((quiz.responses[i] / totalResp) * 100) : 0;
          var isCorrect = i === quiz.correct;
          return React.createElement("div", {key:i,style:{display:"flex",alignItems:"center",gap:12}},
            React.createElement("div", {style:{width:"100%"}},
              React.createElement("div", {style:{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}},
                React.createElement("span", {style:{fontWeight:600}}, opt),
                qRevealed && React.createElement("span", {style:{color:isCorrect ? T.green : T.textMut}}, quiz.responses[i] + " (" + pct + "%)")
              ),
              qRevealed && React.createElement("div", {style:{width:"100%",height:8,borderRadius:6,background:T.surfaceAlt,overflow:"hidden"}},
                React.createElement("div", {style:{height:"100%",width:pct + "%",background:isCorrect ? T.green : T.accent,borderRadius:6}})
              )
            )
          );
        })
      ),
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
        React.createElement("div", {style:{display:"flex",gap:8}},
          React.createElement("button", {onClick:function(){if (props.onToggleQuizReveal) props.onToggleQuizReveal();},style:{border:"none",cursor:"pointer",padding:"8px 14px",borderRadius:10,background:qRevealed ? T.green + "15" : T.surfaceAlt,border:"1px solid " + (qRevealed ? T.green + "44" : T.border),color:qRevealed ? T.green : T.text,fontSize:12,fontWeight:600}}, qRevealed ? "Masquer reponses" : "Reveler reponses"),
          React.createElement("button", {onClick:onQuizNext,style:{border:"none",cursor:"pointer",padding:"8px 14px",borderRadius:10,background:T.accent,color:"#fff",fontSize:12,fontWeight:600}}, "Question Suivante")
        ),
        qRevealed && React.createElement("span", {style:{fontSize:12,fontWeight:700,color:successRate >= 60 ? T.green : T.red,padding:"4px 12px",borderRadius:8,background:successRate >= 60 ? T.green + "10" : T.red + "10"}}, "Reussite: " + successRate + "%")
      )
    );
  }

  if (mod.phase === 4) {
    var pTimer = props.pitchTimer || 30;
    var pRunning = props.pitchRunning || false;
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
        React.createElement("h3", {style:{fontSize:14,fontWeight:700}}, "Pitches"),
        React.createElement("button", {onClick:function(){if (props.onProject) props.onProject("pitch");},style:{border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,background:T.accent,color:"#fff",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
          React.createElement(Monitor, {size:12}),
          "Projeter"
        )
      ),
      React.createElement("div", {style:{textAlign:"center",marginBottom:20,padding:16,borderRadius:12,background:pTimer < 10 ? T.red + "10" : T.accent + "08",border:"2px solid " + (pTimer < 10 ? T.red + "44" : T.accent + "33")}},
        React.createElement("div", {style:{fontFamily:"monospace",fontSize:48,fontWeight:900,color:pTimer < 10 ? T.red : T.accent,lineHeight:1}}, pTimer + "s"),
        React.createElement("div", {style:{fontSize:11,color:T.textMut,marginTop:4}}, pRunning ? "Pitch en cours..." : "Pret"),
        React.createElement("div", {style:{display:"flex",gap:8,justifyContent:"center",marginTop:12}},
          React.createElement("button", {onClick:function(){if (props.onPitchStart) props.onPitchStart();},style:{border:"none",cursor:"pointer",padding:"8px 16px",borderRadius:8,background:pRunning ? T.red : T.green,color:"#fff",fontSize:12,fontWeight:700}}, pRunning ? "Stop" : "Start"),
          React.createElement("button", {onClick:function(){if (props.onPitchNext) props.onPitchNext();},style:{border:"none",cursor:"pointer",padding:"8px 16px",borderRadius:8,background:T.surfaceAlt,color:T.text,fontSize:12,fontWeight:600,border:"1px solid " + T.border}}, "Suivant")
        )
      ),
      React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:8}},
        PITCH_DATA.map(function(p) {
          var isCurrent = p.status === "current";
          return React.createElement("div", {key:p.id,style:{padding:12,borderRadius:10,border:"2px solid " + (isCurrent ? T.accent : T.border),background:isCurrent ? T.accent + "10" : "transparent"}},
            React.createElement("div", {style:{display:"flex",justifyContent:"space-between",marginBottom:4}},
              React.createElement("div", null,
                React.createElement("div", {style:{fontWeight:700,fontSize:12}}, p.title),
                React.createElement("div", {style:{fontSize:11,color:T.textMut}}, p.student)
              ),
              React.createElement("span", {style:{padding:"2px 8px",borderRadius:6,background:p.status === "done" ? T.green + "20" : p.status === "current" ? T.accent + "20" : T.orange + "20",color:p.status === "done" ? T.green : p.status === "current" ? T.accent : T.orange,fontSize:10,fontWeight:600}}, p.status === "done" ? "Termine" : p.status === "current" ? "En cours" : "En attente")
            ),
            p.rating && React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8,marginTop:4}},
              React.createElement("span", {style:{fontSize:11,color:T.gold}}, "⭐ " + p.rating),
              React.createElement("div", {style:{flex:1,height:4,borderRadius:2,background:T.surfaceAlt,overflow:"hidden"}},
                React.createElement("div", {style:{height:"100%",width:(p.rating / 5) * 100 + "%",background:T.gold,borderRadius:2}})
              )
            )
          );
        })
      )
    );
  }

  if (mod.phase === 5) {
    var voterCount = Math.min(totalVotes, 25);
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        React.createElement("div", {style:{display:"flex",alignItems:"center",gap:10}},
          React.createElement("span", {style:{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:8,background:T.green + "15",color:T.green}}, voterCount + "/25 ont vote"),
          React.createElement("div", {style:{width:100,height:6,borderRadius:3,background:T.surfaceAlt,overflow:"hidden"}},
            React.createElement("div", {style:{height:"100%",width:Math.round((voterCount / 25) * 100) + "%",background:T.green,borderRadius:3}})
          )
        ),
        React.createElement("div", {style:{display:"flex",gap:6}},
          React.createElement("button", {onClick:function(){if (props.onVoteReset) props.onVoteReset();},style:{border:"none",cursor:"pointer",padding:"6px 12px",borderRadius:8,background:T.red + "15",border:"1px solid " + T.red + "33",color:T.red,fontSize:11,fontWeight:600}}, "Reinitialiser"),
          React.createElement("button", {style:{border:"none",cursor:"pointer",padding:"6px 12px",borderRadius:8,background:T.accent + "15",border:"1px solid " + T.accent + "33",color:T.accent,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
            React.createElement(Plus, {size:12}),
            "Ajouter option"
          )
        )
      ),
      React.createElement("div", {style:{marginBottom:20,display:"flex",flexDirection:"column",gap:12}},
        sorted.map(function(opt, idx) {
          var pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          var colors = [T.accent, T.pink, T.gold, T.cyan];
          var barColor = colors[idx % colors.length];
          return React.createElement("div", {key:opt.id,style:{display:"flex",alignItems:"center",gap:12}},
            React.createElement("div", {style:{fontSize:24,flexShrink:0}}, opt.emoji),
            React.createElement("div", {style:{flex:1,minWidth:0}},
              React.createElement("div", {style:{display:"flex",justifyContent:"space-between",marginBottom:4}},
                React.createElement("span", {style:{fontSize:13,fontWeight:600}}, opt.text),
                React.createElement("span", {style:{fontSize:13,fontWeight:700,color:barColor}}, opt.votes + " votes")
              ),
              React.createElement("div", {style:{width:"100%",height:10,borderRadius:6,background:T.surfaceAlt,overflow:"hidden"}},
                React.createElement("div", {style:{height:"100%",width:pct + "%",background:barColor,borderRadius:6,transition:"width 0.3s ease"}})
              )
            ),
            React.createElement("span", {style:{fontSize:12,fontWeight:700,color:barColor,minWidth:30,textAlign:"right"}}, pct + "%")
          );
        })
      )
    );
  }

  if (mod.phase === 6) {
    var totalWords = SCENARIO_SCENES.reduce(function(acc, sc) { return acc + (sc.text ? sc.text.split(" ").length : 0); }, 0);
    var validatedScenes = SCENARIO_SCENES.filter(function(sc) { return sc.validated; }).length;
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        React.createElement("h3", {style:{fontSize:14,fontWeight:700}}, "Scenes du Scenario"),
        React.createElement("div", {style:{display:"flex",gap:8,alignItems:"center"}},
          React.createElement("span", {style:{fontSize:10,padding:"4px 8px",borderRadius:6,background:T.surfaceAlt,color:T.textMut}}, totalWords + " mots"),
          React.createElement("span", {style:{fontSize:10,padding:"4px 8px",borderRadius:6,background:T.green + "15",color:T.green}}, validatedScenes + "/" + SCENARIO_SCENES.length + " validees"),
          React.createElement("button", {onClick:function(){if (props.onProject) props.onProject("consigne");},style:{border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,background:T.accent,color:"#fff",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
            React.createElement(Monitor, {size:12}),
            "Projeter"
          )
        )
      ),
      React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:8}},
        SCENARIO_SCENES.map(function(scene) {
          return React.createElement("div", {key:scene.id,style:{padding:12,borderRadius:10,border:"1px solid " + T.border,background:T.card}},
            React.createElement("div", {style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}},
              React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8}},
                React.createElement("span", {style:{fontSize:11,fontWeight:700}}, scene.title),
                scene.validated && React.createElement("span", {style:{padding:"2px 6px",borderRadius:4,background:T.green + "20",color:T.green,fontSize:9,fontWeight:600}}, "Validee")
              ),
              React.createElement("button", {style:{border:"none",cursor:"pointer",padding:"3px 8px",borderRadius:6,background:scene.validated ? T.green + "15" : T.surfaceAlt,color:scene.validated ? T.green : T.textMut,fontSize:9,fontWeight:600}}, scene.validated ? "Devalider" : "Valider")
            ),
            scene.writers.length > 0 && React.createElement("div", {style:{fontSize:10,color:T.textMut,marginBottom:4}}, "Auteurs: " + scene.writers.join(", ")),
            React.createElement("div", {style:{fontSize:11,color:T.textSec}}, scene.text || "[Vide]"),
            scene.text && React.createElement("div", {style:{fontSize:9,color:T.textMut,marginTop:4}}, scene.text.split(" ").length + " mots")
          );
        })
      ),
      React.createElement("button", {style:{border:"none",cursor:"pointer",width:"100%",padding:"10px",borderRadius:10,background:T.accent + "10",border:"1px dashed " + T.accent + "44",color:T.accent,fontSize:12,fontWeight:600,marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}},
        React.createElement(Plus, {size:14}),
        "Ajouter une scene"
      )
    );
  }

  if (mod.phase === 7) {
    var frames = props.storyFrames || STORYBOARD_FRAMES;
    var validatedFrames = frames.filter(function(f) { return f.validated; }).length;
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
        React.createElement("h3", {style:{fontSize:14,fontWeight:700}}, "Storyboard"),
        React.createElement("div", {style:{display:"flex",gap:8,alignItems:"center"}},
          React.createElement("span", {style:{fontSize:10,padding:"4px 8px",borderRadius:6,background:T.green + "15",color:T.green}}, validatedFrames + "/" + frames.length + " plans valides"),
          React.createElement("button", {onClick:function(){if (props.onProject) props.onProject("consigne");},style:{border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,background:T.accent,color:"#fff",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
            React.createElement(Monitor, {size:12}),
            "Projeter"
          )
        )
      ),
      React.createElement("div", {style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
        frames.map(function(fr) {
          return React.createElement("div", {key:fr.id,style:{padding:12,borderRadius:10,border:"1px solid " + (fr.validated ? T.green + "44" : T.border),background:T.card}},
            React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
              React.createElement("span", {style:{fontSize:12,fontWeight:700,color:T.accent}}, fr.scene),
              React.createElement("button", {style:{border:"none",cursor:"pointer",padding:"2px 8px",borderRadius:6,background:fr.validated ? T.green + "15" : T.surfaceAlt,color:fr.validated ? T.green : T.textMut,fontSize:9,fontWeight:600}}, fr.validated ? "✅" : "Valider")
            ),
            React.createElement("div", {style:{width:"100%",height:60,borderRadius:8,background:"linear-gradient(135deg," + T.accent + "22," + T.pink + "22)",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}, "🎬"),
            React.createElement("div", {style:{display:"flex",gap:4,marginBottom:6,flexWrap:"wrap"}},
              React.createElement("span", {style:{fontSize:9,padding:"2px 6px",borderRadius:4,background:T.accent + "15",color:T.accent}}, fr.angle),
              React.createElement("span", {style:{fontSize:9,padding:"2px 6px",borderRadius:4,background:T.pink + "15",color:T.pink}}, fr.movement)
            ),
            React.createElement("div", {style:{fontSize:10,color:T.textSec,lineHeight:1.4}}, fr.desc)
          );
        })
      ),
      React.createElement("button", {style:{border:"none",cursor:"pointer",width:"100%",padding:"10px",borderRadius:10,background:T.accent + "10",border:"1px dashed " + T.accent + "44",color:T.accent,fontSize:12,fontWeight:600,marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}},
        React.createElement(Plus, {size:14}),
        "Ajouter un plan"
      )
    );
  }

  if (mod.phase === 8) {
    var stats = SESSION_STATS;
    return React.createElement("div", {style:{padding:"20px 22px"}},
      React.createElement("div", {style:{textAlign:"center",marginBottom:20,padding:16,borderRadius:12,background:"linear-gradient(135deg," + T.gold + "10," + T.accent + "10)",border:"1px solid " + T.gold + "33"}},
        React.createElement("div", {style:{fontSize:48,marginBottom:8,animation:"pulse2 2s ease infinite"}}, "🎉"),
        React.createElement("h3", {style:{fontSize:18,fontWeight:800,color:T.gold}}, "Festival !"),
        React.createElement("p", {style:{fontSize:12,color:T.textSec}}, "Celebrons le travail de toute la classe")
      ),
      React.createElement("div", {style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}},
        React.createElement("div", {style:{padding:10,borderRadius:10,background:T.card,border:"1px solid " + T.border,textAlign:"center"}},
          React.createElement("div", {style:{fontSize:20,fontWeight:800,color:T.accent}}, stats.totalResponses),
          React.createElement("div", {style:{fontSize:9,color:T.textMut}}, "Reponses totales")
        ),
        React.createElement("div", {style:{padding:10,borderRadius:10,background:T.card,border:"1px solid " + T.border,textAlign:"center"}},
          React.createElement("div", {style:{fontSize:20,fontWeight:800,color:T.green}}, stats.avgEngagement + "%"),
          React.createElement("div", {style:{fontSize:9,color:T.textMut}}, "Engagement moyen")
        ),
        React.createElement("div", {style:{padding:10,borderRadius:10,background:T.card,border:"1px solid " + T.border,textAlign:"center"}},
          React.createElement("div", {style:{fontSize:20,fontWeight:800,color:T.gold}}, stats.topContributor),
          React.createElement("div", {style:{fontSize:9,color:T.textMut}}, "Top contributeur")
        )
      ),
      React.createElement("h4", {style:{fontSize:13,fontWeight:700,marginBottom:10}}, "Roles de l'Equipe"),
      React.createElement("div", {style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}},
        TEAM_ROLES.map(function(tr) {
          return React.createElement("div", {key:tr.role,style:{padding:12,borderRadius:10,border:"1px solid " + T.border,background:T.card}},
            React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8,marginBottom:6}},
              React.createElement("span", {style:{fontSize:20}}, tr.icon),
              React.createElement("span", {style:{fontSize:11,fontWeight:700}}, tr.role)
            ),
            React.createElement("select", {style:{width:"100%",padding:"6px 8px",borderRadius:8,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.text,fontSize:10,fontFamily:"inherit"},value:tr.assigned || ""},
              React.createElement("option", {value:""}, "Non assigne"),
              STUDENTS.filter(function(s){ return s.status === "active"; }).slice(0, 10).map(function(s) {
                return React.createElement("option", {key:s.id,value:s.name}, s.name);
              })
            )
          );
        })
      ),
      React.createElement("button", {style:{border:"none",cursor:"pointer",width:"100%",padding:"12px",borderRadius:10,background:"linear-gradient(135deg," + T.accent + "," + T.pink + ")",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}},
        React.createElement(Download, {size:14}),
        "Exporter le rapport de session"
      )
    );
  }

  return React.createElement("div", null);
}

/* Projected Screen Component */
function ProjectedScreen(props) {
  var T = props.T;
  var projView = props.projView;
  var voteData = props.voteData;
  var mancheTimeLeft = props.mancheTimeLeft;
  var consigneText = props.consigneText;
  var revealCount = props.revealCount;
  var totalVotes = props.totalVotes;
  var sorted = props.sorted;

  var barColor = function(idx){
    var colors = [T.accent, T.pink, T.gold, T.cyan];
    return colors[idx % colors.length];
  };

  return (
    React.createElement("div", {style:{width:"100%",height:"100%",background:projView === "black" ? "#000" : T.bg,color:T.text,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",padding:20}},
      projView === "vote" && !revealCount && React.createElement("div", {style:{width:"100%",maxWidth:1000,animation:"fadeIn 0.5s ease"}},
        React.createElement("div", {style:{textAlign:"center",marginBottom:60}},
          React.createElement("h1", {style:{fontSize:64,fontWeight:900,marginBottom:24}}, "VOTEZ MAINTENANT"),
          React.createElement("div", {style:{fontSize:20,color:T.textMut}}, "Manche 3/8 — Le film gagnant")
        ),
        React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:20}},
          voteData.map(function(opt, idx) {
            var pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            return React.createElement("div", {key:opt.id,style:{display:"flex",alignItems:"center",gap:20}},
              React.createElement("div", {style:{fontSize:48,flexShrink:0}}, opt.emoji),
              React.createElement("div", {style:{flex:1}},
                React.createElement("div", {style:{fontSize:20,fontWeight:700,marginBottom:8,color:T.text}}, opt.text),
                React.createElement("div", {style:{width:"100%",height:16,borderRadius:8,background:T.surfaceAlt,overflow:"hidden",position:"relative"}},
                  React.createElement("div", {style:{height:"100%",width:pct + "%",background:barColor(idx),borderRadius:8,transition:"width 0.4s ease",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:12}},
                    React.createElement("span", {style:{fontSize:16,fontWeight:900,color:"#fff"}}, opt.votes + " votes")
                  )
                )
              ),
              React.createElement("div", {style:{fontSize:28,fontWeight:900,color:barColor(idx)}}, pct + "%")
            );
          })
        ),
        React.createElement("div", {style:{textAlign:"center",marginTop:60,fontSize:20,color:T.textMut}},
          React.createElement("span", {style:{fontFamily:"monospace",fontSize:28,fontWeight:900,color:T.accent}}, mancheTimeLeft + " sec")
        )
      ),

      projView === "vote" && revealCount && React.createElement("div", {style:{textAlign:"center",animation:"countPulse 0.5s ease"}},
        React.createElement("h1", {style:{fontSize:140,fontWeight:900,color:T.accent,margin:0}}, revealCount)
      ),

      projView === "result" && React.createElement("div", {style:{textAlign:"center",animation:"fadeIn 0.6s ease"}},
        React.createElement("div", {style:{fontSize:120,marginBottom:30,animation:"pulse2 1s ease infinite"}}, sorted[0] ? sorted[0].emoji : ""),
        React.createElement("h1", {style:{fontSize:56,fontWeight:900,marginBottom:20,color:T.gold}}, sorted[0] ? sorted[0].text : ""),
        React.createElement("div", {style:{fontSize:32,color:T.green,fontWeight:700,marginBottom:40}}, "🎉 GAGNANT! 🎉"),
        React.createElement("hr", {style:{border:"none",borderTop:"2px solid " + T.border,margin:"40px 0"}}),
        React.createElement("div", {style:{fontSize:28,color:T.red,fontWeight:700,marginBottom:16}}, "Elimine"),
        React.createElement("div", {style:{fontSize:32,fontWeight:900}}, sorted[sorted.length - 1] ? sorted[sorted.length - 1].text : "")
      ),

      projView === "qr" && React.createElement("div", {style:{textAlign:"center",animation:"fadeIn 0.5s ease"}},
        React.createElement("h1", {style:{fontSize:48,fontWeight:900,marginBottom:40}}, "Scannez pour rejoindre"),
        React.createElement("div", {style:{width:320,height:320,margin:"0 auto 40px",borderRadius:20,background:T.card,border:"4px solid " + T.accent,display:"flex",alignItems:"center",justifyContent:"center"}},
          React.createElement(QrCode, {size:280,color:T.accent})
        ),
        React.createElement("div", {style:{fontSize:18,color:T.textMut,marginBottom:16}}, "Ou entrez le code :"),
        React.createElement("div", {style:{fontSize:72,fontWeight:900,letterSpacing:"0.3em",color:T.accent,fontFamily:"monospace"}}, "4 8 2 7")
      ),

      projView === "consigne" && React.createElement("div", {style:{textAlign:"center",animation:"fadeIn 0.5s ease"}},
        React.createElement("h1", {style:{fontSize:80,fontWeight:900,lineHeight:1.2,maxWidth:900}}, consigneText || "Entrez une consigne...")
      ),

      projView === "waiting" && React.createElement("div", {style:{textAlign:"center",animation:"fadeIn 0.5s ease"}},
        React.createElement("div", {style:{fontSize:120,marginBottom:40,animation:"pulse2 2s ease infinite"}}, "🎬"),
        React.createElement("h1", {style:{fontSize:56,fontWeight:900,marginBottom:20}}, "Preparez-vous..."),
        React.createElement("p", {style:{fontSize:20,color:T.textMut}}, "La manche va bientot commencer")
      ),

      projView === "bracket" && React.createElement("div", {style:{padding:40,animation:"fadeIn 0.5s ease"}},
        React.createElement("h1", {style:{fontSize:48,fontWeight:900,textAlign:"center",marginBottom:40}}, "Historique des manches"),
        React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:20}},
          props.mancheHist.map(function(m) {
            return React.createElement("div", {key:m.round,style:{padding:20,background:T.card,border:"2px solid " + T.border,borderRadius:16}},
              React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
                React.createElement("div", {style:{fontSize:20,fontWeight:700}}, "Manche " + m.round),
                React.createElement("div", {style:{fontSize:16,color:T.gold,fontWeight:700}}, m.winner + " (" + m.winPct + "%)")
              ),
              React.createElement("div", {style:{fontSize:14,color:T.red}}, "Elimine: " + m.eliminated + " (" + m.pct + "%)")
            );
          })
        )
      ),

      projView === "debate" && React.createElement("div", {style:{padding:40,animation:"fadeIn 0.5s ease"}},
        React.createElement("h1", {style:{fontSize:48,fontWeight:900,textAlign:"center",marginBottom:40}}, "A debattre"),
        React.createElement("div", {style:{display:"flex",gap:30,justifyContent:"center",flexWrap:"wrap"}},
          voteData.slice(0, 3).map(function(opt, idx) {
            return React.createElement("div", {key:opt.id,style:{textAlign:"center",flex:1,minWidth:200}},
              React.createElement("div", {style:{fontSize:80,marginBottom:20}}, opt.emoji),
              React.createElement("h2", {style:{fontSize:28,fontWeight:900}}, opt.text)
            );
          })
        )
      ),

      projView === "quiz" && React.createElement("div", {style:{textAlign:"center",padding:60,animation:"fadeIn 0.5s ease"}},
        React.createElement("div", {style:{fontSize:20,color:T.textMut,marginBottom:20}}, "Question " + (props.currentQuizIdx + 1) + "/" + QUIZ_DATA.length),
        React.createElement("h1", {style:{fontSize:56,fontWeight:900,marginBottom:40,maxWidth:900,margin:"0 auto 40px"}}, QUIZ_DATA[props.currentQuizIdx || 0].question),
        React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:16,maxWidth:700,margin:"0 auto"}},
          QUIZ_DATA[props.currentQuizIdx || 0].options.map(function(opt, i) {
            return React.createElement("div", {key:i,style:{padding:"20px 30px",borderRadius:16,background:T.card,border:"2px solid " + T.border,fontSize:28,fontWeight:600,textAlign:"left"}},
              String.fromCharCode(65 + i) + ". " + opt
            );
          })
        )
      ),

      projView === "image" && React.createElement("div", {style:{textAlign:"center",padding:40,animation:"fadeIn 0.5s ease"}},
        React.createElement("div", {style:{width:"80%",maxWidth:800,height:500,margin:"0 auto 30px",borderRadius:20,background:"linear-gradient(135deg," + T.accent + "," + T.pink + ")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:120}}, "🖼️"),
        React.createElement("h2", {style:{fontSize:36,fontWeight:900}}, IMAGE_STIMULI[props.currentImageIdx || 0].title),
        React.createElement("p", {style:{fontSize:20,color:T.textMut,marginTop:10}}, IMAGE_STIMULI[props.currentImageIdx || 0].desc)
      ),

      projView === "writing" && React.createElement("div", {style:{padding:60,animation:"fadeIn 0.5s ease",maxWidth:900,margin:"0 auto"}},
        React.createElement("h1", {style:{fontSize:48,fontWeight:900,textAlign:"center",marginBottom:40}}, WRITING_PROMPTS[0].prompt),
        React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:20}},
          WRITING_PROMPTS[0].responses.map(function(resp, i) {
            return React.createElement("div", {key:i,style:{padding:24,borderRadius:16,background:T.card,border:"2px solid " + T.border}},
              React.createElement("div", {style:{fontSize:18,fontWeight:700,marginBottom:8,color:T.accent}}, resp.name),
              React.createElement("div", {style:{fontSize:22,lineHeight:1.6}}, resp.text)
            );
          })
        )
      ),

      projView === "pitch" && React.createElement("div", {style:{textAlign:"center",padding:60,animation:"fadeIn 0.5s ease"}},
        React.createElement("h2", {style:{fontSize:28,color:T.textMut,marginBottom:20}}, "Pitch en cours"),
        React.createElement("div", {style:{fontSize:160,fontWeight:900,color:props.pitchTimer < 10 ? T.red : T.accent,fontFamily:"monospace",lineHeight:1}}, (props.pitchTimer || 30) + "s"),
        React.createElement("div", {style:{fontSize:32,fontWeight:700,marginTop:30}},
          PITCH_DATA.find(function(p){ return p.status === "current"; }) ? PITCH_DATA.find(function(p){ return p.status === "current"; }).student : ""
        ),
        React.createElement("div", {style:{fontSize:24,color:T.textSec,marginTop:10}},
          PITCH_DATA.find(function(p){ return p.status === "current"; }) ? PITCH_DATA.find(function(p){ return p.status === "current"; }).title : ""
        )
      ),

      React.createElement("div", {className:"facilitator-only",style:{position:"absolute",bottom:30,left:"50%",transform:"translateX(-50%)",background:T.surface + "dd",backdropFilter:"blur(16px)",border:"1px solid " + T.border,borderRadius:20,padding:"12px 20px",display:"flex",alignItems:"center",gap:16,zIndex:50}},
        React.createElement("span", {style:{fontSize:12,color:T.textMut}}, "Facilitateur — Controles de projection"),
        React.createElement("div", {style:{width:1,height:20,background:T.border}}),
        React.createElement(Maximize, {size:16,color:T.textMut}),
        React.createElement("span", {style:{fontSize:12,color:T.textMut}}, "Plein ecran")
      )
    )
  );
}

export default function CockpitV5() {
  /* Main phase state */
  var phaseState = useState("presession");
  var phase = phaseState[0];
  var setPhase = phaseState[1];

  var isDarkState = useState(true);
  var isDark = isDarkState[0];
  var setIsDark = isDarkState[1];

  /* Session selection */
  var selClassState = useState(null);
  var selClass = selClassState[0];
  var setSelClass = selClassState[1];

  var selModuleState = useState(4);
  var selModule = selModuleState[0];
  var setSelModule = selModuleState[1];

  var selFormuleState = useState("f1");
  var selFormule = selFormuleState[0];
  var setSelFormule = selFormuleState[1];

  /* Session state */
  var sessionOnState = useState(false);
  var sessionOn = sessionOnState[0];
  var setSessionOn = sessionOnState[1];

  var elapsedState = useState(0);
  var elapsed = elapsedState[0];
  var setElapsed = elapsedState[1];

  var mancheState = useState(3);
  var manche = mancheState[0];
  var setManche = mancheState[1];

  var voteStateState = useState("closed");
  var voteState = voteStateState[0];
  var setVoteState = voteStateState[1];

  var mancheTimerState = useState(180);
  var mancheTimer = mancheTimerState[0];

  var mancheTimeLeftState = useState(180);
  var mancheTimeLeft = mancheTimeLeftState[0];
  var setMancheTimeLeft = mancheTimeLeftState[1];

  var voteDataState = useState(VOTE_OPTS);
  var voteData = voteDataState[0];
  var setVoteData = voteDataState[1];

  var revealCountState = useState(null);
  var revealCount = revealCountState[0];
  var setRevealCount = revealCountState[1];

  var mancheHistState = useState(MANCHE_HISTORY);
  var mancheHist = mancheHistState[0];
  var setMancheHist = mancheHistState[1];

  /* Module-specific state */
  var currentImageIdxState = useState(0);
  var currentImageIdx = currentImageIdxState[0];
  var setCurrentImageIdx = currentImageIdxState[1];

  var currentQuizIdxState = useState(0);
  var currentQuizIdx = currentQuizIdxState[0];
  var setCurrentQuizIdx = currentQuizIdxState[1];

  var pitchTimerState = useState(30);
  var pitchTimer = pitchTimerState[0];
  var setPitchTimer = pitchTimerState[1];

  var pitchRunningState = useState(false);
  var pitchRunning = pitchRunningState[0];
  var setPitchRunning = pitchRunningState[1];

  var quizTimerState = useState(30);
  var quizTimer = quizTimerState[0];
  var setQuizTimer = quizTimerState[1];

  var quizRevealedState = useState(false);
  var quizRevealed = quizRevealedState[0];
  var setQuizRevealed = quizRevealedState[1];

  var currentPromptIdxState = useState(0);
  var currentPromptIdx = currentPromptIdxState[0];
  var setCurrentPromptIdx = currentPromptIdxState[1];

  var storyFramesState = useState(STORYBOARD_FRAMES);
  var storyFrames = storyFramesState[0];
  var setStoryFrames = storyFramesState[1];

  var responsesFilterState = useState("all");
  var responsesFilter = responsesFilterState[0];
  var setResponsesFilter = responsesFilterState[1];

  var studentSearchState = useState("");
  var studentSearch = studentSearchState[0];
  var setStudentSearch = studentSearchState[1];

  var notifSoundState = useState(true);
  var notifSound = notifSoundState[0];
  var setNotifSound = notifSoundState[1];

  var projAutoSyncState = useState(true);
  var projAutoSync = projAutoSyncState[0];
  var setProjAutoSync = projAutoSyncState[1];

  /* Projection state */
  var projViewState = useState("vote");
  var projView = projViewState[0];
  var setProjView = projViewState[1];

  var consigneTextState = useState("");
  var consigneText = consigneTextState[0];
  var setConsigneText = consigneTextState[1];

  var showProjectionState = useState(false);
  var showProjection = showProjectionState[0];
  var setShowProjection = showProjectionState[1];

  /* Session management */
  var sessionNotesState = useState("");
  var sessionNotes = sessionNotesState[0];
  var setSessionNotes = sessionNotesState[1];

  var globalTimerState = useState(900);
  var globalTimer = globalTimerState[0];
  var setGlobalTimer = globalTimerState[1];

  /* Sidebar */
  var sideOpenState = useState(true);
  var sideOpen = sideOpenState[0];
  var setSideOpen = sideOpenState[1];

  var sideTabState = useState("students");
  var sideTab = sideTabState[0];
  var setSideTab = sideTabState[1];

  var selStudentState = useState(null);
  var selStudent = selStudentState[0];
  var setSelStudent = selStudentState[1];

  var cmdOpenState = useState(false);
  var cmdOpen = cmdOpenState[0];
  var setCmdOpen = cmdOpenState[1];

  var cmdQState = useState("");
  var cmdQ = cmdQState[0];
  var setCmdQ = cmdQState[1];

  var filterState = useState("all");
  var filter = filterState[0];
  var setFilter = filterState[1];

  var soundOnState = useState(true);
  var soundOn = soundOnState[0];
  var setSoundOn = soundOnState[1];

  var showConfirmState = useState(null);
  var showConfirm = showConfirmState[0];
  var setShowConfirm = showConfirmState[1];

  var msgModalState = useState(null);
  var msgModal = msgModalState[0];
  var setMsgModal = msgModalState[1];

  var hiddenResponsesState = useState(new Set());
  var hiddenResponses = hiddenResponsesState[0];
  var setHiddenResponses = hiddenResponsesState[1];

  var notifsState = useState([
    {id:1,text:"Lea C. a soumis sa reponse",time:"12s",icon:"✏️",cat:"response"},
    {id:2,text:"Vote manche 2 termine",time:"1min",icon:"🗳️",cat:"vote"},
    {id:3,text:"Amina G. serie de 6 !",time:"2min",icon:"🔥",cat:"achievement"},
  ]);
  var notifs = notifsState[0];
  var setNotifs = notifsState[1];

  var T = isDark ? themes.dark : themes.light;
  var mod = MODULES[selModule];

  var totalVotes = useMemo(function(){ return voteData.reduce(function(a, b){ return a + b.votes; }, 0); }, [voteData]);
  var sorted = useMemo(function(){ return voteData.slice().sort(function(a, b){ return b.votes - a.votes; }); }, [voteData]);
  var activeCount = useMemo(function(){ return STUDENTS.filter(function(s){ return s.status === "active"; }).length; }, []);
  var disconnCount = useMemo(function(){ return STUDENTS.filter(function(s){ return s.status === "disconnected"; }).length; }, []);
  var idleCount = useMemo(function(){ return STUDENTS.filter(function(s){ return s.status === "idle"; }).length; }, []);
  var respondCount = useMemo(function(){ return STUDENTS.filter(function(s){ return s.responding; }).length; }, []);
  var avgXP = useMemo(function(){ return Math.round(STUDENTS.reduce(function(a, s){ return a + s.xp; }, 0) / STUDENTS.length); }, []);
  var handRaisedCount = useMemo(function(){ return STUDENTS.filter(function(s){ return s.handRaised; }).length; }, []);

  var filteredResponses = useMemo(function(){
    if (responsesFilter === "pending") return ALL_RESPONSES.filter(function(r){ return r.status === "pending"; });
    if (responsesFilter === "validated") return ALL_RESPONSES.filter(function(r){ return r.status === "validated"; });
    if (responsesFilter === "flagged") return ALL_RESPONSES.filter(function(r){ return r.status === "flagged"; });
    return ALL_RESPONSES;
  }, [responsesFilter]);

  var filtered = useMemo(function(){
    var base = STUDENTS;
    if (filter === "active") base = STUDENTS.filter(function(s){ return s.status === "active"; });
    if (filter === "idle") base = STUDENTS.filter(function(s){ return s.status === "idle"; });
    if (filter === "disconnected") base = STUDENTS.filter(function(s){ return s.status === "disconnected"; });
    if (filter === "responding") base = STUDENTS.filter(function(s){ return s.responding; });
    if (filter === "handsup") base = STUDENTS.filter(function(s){ return s.handRaised; });
    if (studentSearch) {
      var q = studentSearch.toLowerCase();
      base = base.filter(function(s){ return s.name.toLowerCase().indexOf(q) >= 0; });
    }
    return base;
  }, [filter, studentSearch]);

  var notConnected = useMemo(function(){ return STUDENTS.filter(function(s){ return s.status !== "active"; }); }, []);

  var techAlerts = [
    {id:1,student:"Theo P.",msg:"Erreur chargement page vote",severity:"high"},
    {id:2,student:"Noah H.",msg:"Deconnecte (2e fois)",severity:"medium"},
  ];

  /* Timers */
  useEffect(function(){
    if (phase !== "session" || !sessionOn) return;
    var t = setInterval(function(){ setElapsed(function(e){ return e + 1; }); }, 1000);
    return function(){ clearInterval(t); };
  }, [phase, sessionOn]);

  useEffect(function(){
    if (phase !== "session" || !sessionOn) return;
    var t = setInterval(function(){ setGlobalTimer(function(g){ return g > 0 ? g - 1 : 0; }); }, 1000);
    return function(){ clearInterval(t); };
  }, [phase, sessionOn]);

  useEffect(function(){
    if (voteState !== "open") return;
    var t = setInterval(function(){
      setMancheTimeLeft(function(p){
        if (p <= 1) { setVoteState("closed"); return 0; }
        return p - 1;
      });
    }, 1000);
    return function(){ clearInterval(t); };
  }, [voteState]);

  /* Pitch countdown timer */
  useEffect(function(){
    if (!pitchRunning) return;
    var t = setInterval(function(){
      setPitchTimer(function(p){
        if (p <= 1) { setPitchRunning(false); return 0; }
        return p - 1;
      });
    }, 1000);
    return function(){ clearInterval(t); };
  }, [pitchRunning]);

  /* Quiz countdown timer */
  useEffect(function(){
    if (quizRevealed) return;
    if (mod.phase !== 3) return;
    var t = setInterval(function(){
      setQuizTimer(function(p){
        if (p <= 1) { setQuizRevealed(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return function(){ clearInterval(t); };
  }, [quizRevealed, mod.phase]);

  useEffect(function(){
    if (voteState !== "open") return;
    var names = ["Rayan J.","Ibrahim N.","Bilal T.","Youssef V."];
    var t = setInterval(function(){
      setVoteData(function(p){ var c = p.map(function(v){ return Object.assign({}, v); }); c[Math.floor(Math.random() * c.length)].votes += 1; return c; });
      setNotifs(function(p){ var n = names[Math.floor(Math.random() * 4)]; return [{id:Date.now(),text:n + " a vote",time:"now",icon:"🗳️",cat:"vote"}].concat(p.slice(0, 6)); });
    }, 3000);
    return function(){ clearInterval(t); };
  }, [voteState]);

  useEffect(function(){
    var h = function(e){
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(function(o){ return !o; }); }
      if (e.key === "Escape") { setCmdOpen(false); setSelStudent(null); setShowConfirm(null); setMsgModal(null); }
    };
    window.addEventListener("keydown", h);
    return function(){ window.removeEventListener("keydown", h); };
  }, [cmdOpen, phase]);

  /* Actions */
  var openVote = function(){ setVoteState("open"); setMancheTimeLeft(mancheTimer); setProjView("vote"); };
  var closeVote = function(){ setShowConfirm("close"); };
  var confirmCloseVote = function(){ setVoteState("closed"); setShowConfirm(null); };
  var startReveal = function(){
    setVoteState("revealing"); setRevealCount(3);
    setTimeout(function(){ setRevealCount(2); }, 1000);
    setTimeout(function(){ setRevealCount(1); }, 2000);
    setTimeout(function(){ setRevealCount(null); setVoteState("revealed"); }, 3000);
    setProjView("result");
  };
  var nextManche = function(){ setShowConfirm("next"); };
  var confirmNext = function(){
    var last = sorted[sorted.length - 1];
    var first = sorted[0];
    setMancheHist(function(p){ return p.concat([{round:manche,eliminated:last.text,pct:Math.round((last.votes / totalVotes) * 100),winner:first.text,winPct:Math.round((first.votes / totalVotes) * 100)}]); });
    setManche(function(m){ return m + 1; }); setVoteState("closed"); setShowConfirm(null);
    setVoteData(function(p){ return p.map(function(v){ return Object.assign({}, v, {votes: Math.floor(Math.random() * 8) + 1}); }); });
    setProjView("waiting");
  };
  var endSession = function(){ setPhase("recap"); };

  var onImageNext = function(){ if (currentImageIdx < IMAGE_STIMULI.length - 1) { setCurrentImageIdx(currentImageIdx + 1); } };
  var onImagePrev = function(){ if (currentImageIdx > 0) { setCurrentImageIdx(currentImageIdx - 1); } };
  var onQuizNext = function(){ if (currentQuizIdx < QUIZ_DATA.length - 1) { setCurrentQuizIdx(currentQuizIdx + 1); } };

  var fmtT = function(s){ return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  var bs = {border:"none",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s ease"};
  var touch = {minWidth:44,minHeight:44};

  var handleMsgSend = function(studentName, icon) {
    setMsgModal(null);
    setNotifs(function(p){ return [{id:Date.now(),text:"Message envoye a " + studentName,time:"now",icon:icon,cat:"response"}].concat(p.slice(0, 6)); });
  };

  var cls = CLASSES.find(function(c){ return c.id === selClass; });

  var css = [
    "@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}}",
    "@keyframes pulse2{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(2.2);opacity:0}}",
    "@keyframes shimmer{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}",
    "@keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}",
    "@keyframes fadeIn{from{opacity:0}to{opacity:1}}",
    "@keyframes countPulse{0%{transform:scale(.5);opacity:0}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}",
    "@keyframes breathe{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.3)}50%{box-shadow:0 0 0 10px rgba(139,92,246,0)}}",
    "*{box-sizing:border-box;margin:0;padding:0}",
    ":focus-visible{outline:2px solid " + T.accent + ";outline-offset:2px;border-radius:4px}",
    "::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:" + T.bg + "}::-webkit-scrollbar-thumb{background:" + T.border + ";border-radius:3px}",
    "button:active{transform:scale(.97)!important}",
    ".facilitator-only{pointer-events:none;opacity:0.3;}",
    "@media(max-width:1024px){.mgrid{grid-template-columns:1fr!important}.side{position:fixed!important;right:0;top:0;bottom:0;z-index:200!important;width:340px!important;box-shadow:-4px 0 24px #00000044}}",
    "@media(max-width:768px){.hcenter{display:none!important}.sgrid{grid-template-columns:repeat(2,1fr)!important}}",
  ].join("\n");

  return (
    React.createElement("div", {style:{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",fontSize:14,position:"relative"}},
      React.createElement("style", null, css),

      /* PROJECTION SCREEN (fullscreen) */
      showProjection && React.createElement("div", {style:{position:"fixed",inset:0,zIndex:9998,background:T.bg}},
        React.createElement(ProjectedScreen, {T:T,projView:projView,voteData:voteData,mancheTimeLeft:mancheTimeLeft,consigneText:consigneText,revealCount:revealCount,totalVotes:totalVotes,sorted:sorted,mancheHist:mancheHist,currentQuizIdx:currentQuizIdx,currentImageIdx:currentImageIdx,pitchTimer:pitchTimer})
      ),

      /* PRE-SESSION */
      phase === "presession" && React.createElement("div", {style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24}},
        React.createElement("div", {style:{width:"100%",maxWidth:520,animation:"fadeIn .4s ease"}},
          React.createElement("div", {style:{textAlign:"center",marginBottom:32}},
            React.createElement("div", {style:{fontSize:48,marginBottom:8}}, "🎬"),
            React.createElement("h1", {style:{fontSize:28,fontWeight:900,background:"linear-gradient(135deg," + T.accent + "," + T.pink + ")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:0}}, "BANLIEUWOOD"),
            React.createElement("p", {style:{color:T.textMut,fontSize:13,marginTop:4}}, "Cockpit Intervenant V6")
          ),

          /* Formule selector */
          React.createElement("div", {style:{background:T.card,border:"1px solid " + T.border,borderRadius:16,padding:24,marginBottom:16}},
            React.createElement("h2", {style:{fontSize:15,fontWeight:700,marginBottom:16}}, "Choisir la formule"),
            React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:8}},
              FORMULES.map(function(f) {
                return React.createElement("button", {key:f.id,onClick:function(){setSelFormule(f.id);},style:Object.assign({}, bs, touch, {display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,background:selFormule === f.id ? T.accent + "15" : "transparent",border:"1.5px solid " + (selFormule === f.id ? T.accent + "66" : T.border),color:T.text,textAlign:"left",width:"100%"})},
                  React.createElement("div", null,
                    React.createElement("div", {style:{fontSize:14,fontWeight:600}}, f.name),
                    React.createElement("div", {style:{fontSize:12,color:T.textMut}}, f.duration + " — " + f.sessions + " seance(s)")
                  ),
                  selFormule === f.id && React.createElement(Check, {size:18,color:T.accent})
                );
              })
            )
          ),

          /* Class selector */
          React.createElement("div", {style:{background:T.card,border:"1px solid " + T.border,borderRadius:16,padding:24,marginBottom:16}},
            React.createElement("h2", {style:{fontSize:15,fontWeight:700,marginBottom:16}}, "Choisir une classe"),
            React.createElement("div", {style:{display:"flex",flexDirection:"column",gap:8}},
              CLASSES.map(function(c) {
                return React.createElement("button", {key:c.id,onClick:function(){setSelClass(c.id);},style:Object.assign({}, bs, touch, {display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,background:selClass === c.id ? T.accent + "15" : "transparent",border:"1.5px solid " + (selClass === c.id ? T.accent + "66" : T.border),color:T.text,textAlign:"left",width:"100%"})},
                  React.createElement(Users, {size:18,color:selClass === c.id ? T.accent : T.textMut}),
                  React.createElement("div", {style:{flex:1}},
                    React.createElement("div", {style:{fontSize:14,fontWeight:600}}, c.name),
                    React.createElement("div", {style:{fontSize:12,color:T.textMut}}, c.school + " — " + c.count + " eleves" + (c.lastSessionDate ? " — Derniere session: " + c.lastSessionDate : ""))
                  ),
                  selClass === c.id && React.createElement(Check, {size:18,color:T.accent})
                );
              })
            )
          ),

          /* Resume session button */
          selClass && CLASSES.find(function(c){ return c.id === selClass; }).lastSessionDate && React.createElement("button", {onClick:function(){setPhase("qrcode");},style:Object.assign({}, bs, touch, {width:"100%",padding:"12px 16px",borderRadius:12,marginBottom:16,background:T.green + "15",border:"1.5px solid " + T.green + "44",color:T.green,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8})},
            React.createElement(RotateCcw, {size:16}),
            "Reprendre la derniere session"
          ),

          selClass && React.createElement("div", {style:{display:"flex",gap:10,animation:"slideUp .3s ease .1s both"}},
            React.createElement("button", {onClick:function(){setPhase("qrcode");},style:Object.assign({}, bs, touch, {flex:1,padding:"14px 20px",borderRadius:14,background:"linear-gradient(135deg," + T.accent + "," + T.pink + ")",color:"#fff",fontSize:15,fontWeight:700,boxShadow:"0 4px 20px " + T.accent + "44"})},
              React.createElement(QrCode, {size:18,style:{marginRight:8,verticalAlign:"middle"}}),
              "Lancer la session"
            ),
            React.createElement("button", {onClick:function(){setIsDark(!isDark);},style:Object.assign({}, bs, touch, {width:48,borderRadius:14,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"})},
              isDark ? React.createElement(Sun, {size:18}) : React.createElement(Moon, {size:18})
            )
          )
        )
      ),

      /* QR CODE */
      phase === "qrcode" && React.createElement("div", {style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center"}},
        React.createElement("div", {style:{animation:"fadeIn .4s ease"}},
          React.createElement("div", {style:{fontSize:14,color:T.textMut,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,marginBottom:8}},
            cls ? cls.name : "" + " — " + (cls ? cls.school : "")
          ),
          React.createElement("h1", {style:{fontSize:24,fontWeight:800,marginBottom:24}}, "Scannez pour rejoindre"),

          React.createElement("div", {style:{width:240,height:240,margin:"0 auto 20px",borderRadius:20,background:T.card,border:"2px solid " + T.border,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 32px " + T.accent + "22"}},
            React.createElement("div", {style:{textAlign:"center"}},
              React.createElement(QrCode, {size:120,color:T.accent,strokeWidth:1}),
              React.createElement("div", {style:{fontSize:10,color:T.textMut,marginTop:8}}, "bwood.app/join")
            )
          ),

          React.createElement("div", {style:{fontSize:12,color:T.textMut,marginBottom:8}}, "Ou entrer le code :"),
          React.createElement("div", {style:{fontSize:42,fontWeight:900,letterSpacing:"0.2em",color:T.accent,marginBottom:24,fontFamily:"monospace"}},
            "4 8 2 7"
          ),

          React.createElement("div", {style:{display:"inline-flex",alignItems:"center",gap:10,padding:"10px 20px",borderRadius:30,background:T.green + "15",border:"1px solid " + T.green + "44",marginBottom:12},role:"status","aria-live":"polite"},
            React.createElement("span", {style:{width:10,height:10,borderRadius:"50%",background:T.green,position:"relative",display:"inline-block"}},
              React.createElement("span", {style:{position:"absolute",inset:-3,borderRadius:"50%",background:T.green,opacity:.4,animation:"pulse2 2s ease infinite"}})
            ),
            React.createElement("span", {style:{fontSize:16,fontWeight:700,color:T.green}}, activeCount),
            React.createElement("span", {style:{color:T.textMut,fontSize:13}}, "/ " + (cls ? cls.count : 25) + " connectes"),
            React.createElement("span", {style:{fontSize:13,fontWeight:700,color:T.accent,marginLeft:8}}, Math.round((activeCount / (cls ? cls.count : 25)) * 100) + "%")
          ),
          React.createElement("div", {style:{width:"80%",maxWidth:300,height:6,borderRadius:3,background:T.surfaceAlt,margin:"0 auto 8px",overflow:"hidden"}},
            React.createElement("div", {style:{height:"100%",width:Math.round((activeCount / (cls ? cls.count : 25)) * 100) + "%",background:"linear-gradient(90deg," + T.green + "," + T.accent + ")",borderRadius:3,transition:"width 0.5s ease"}})
          ),
          React.createElement("div", {style:{fontSize:11,color:T.textMut,marginBottom:12}}, "Demarrage auto a 80% (" + Math.ceil((cls ? cls.count : 25) * 0.8) + " eleves)"),
          React.createElement("button", {onClick:function(){setNotifs(function(p){ return [{id:Date.now(),text:"Rappel envoye aux non-connectes",time:"now",icon:"📨",cat:"response"}].concat(p.slice(0, 6)); });},style:Object.assign({}, bs, touch, {padding:"10px 20px",borderRadius:12,background:T.orange + "15",border:"1px solid " + T.orange + "44",color:T.orange,fontSize:12,fontWeight:600,marginBottom:16})},
            React.createElement(Send, {size:14,style:{marginRight:6,verticalAlign:"middle"}}),
            "Envoyer rappel"
          ),

          notConnected.length > 0 && React.createElement("div", {style:{padding:"12px 16px",borderRadius:12,background:T.red + "10",border:"1px solid " + T.red + "33",marginBottom:20}},
            React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8,marginBottom:8}},
              React.createElement(AlertTriangle, {size:16,color:T.red}),
              React.createElement("span", {style:{fontSize:12,fontWeight:600,color:T.red}}, notConnected.length + " non connectes")
            ),
            React.createElement("div", {style:{fontSize:11,color:T.textSec}},
              notConnected.slice(0, 3).map(function(s){ return s.name; }).join(", ")
            )
          ),

          React.createElement("div", {style:{display:"flex",gap:10}},
            React.createElement("button", {onClick:function(){setPhase("session");},style:Object.assign({}, bs, touch, {flex:1,padding:"14px 20px",borderRadius:14,background:"linear-gradient(135deg," + T.accent + "," + T.pink + ")",color:"#fff",fontSize:15,fontWeight:700,boxShadow:"0 4px 20px " + T.accent + "44"})},
              React.createElement(Play, {size:18,style:{marginRight:8,verticalAlign:"middle"}}),
              "Demarrer"
            ),
            React.createElement("button", {onClick:function(){setPhase("presession");},style:Object.assign({}, bs, touch, {padding:"14px 20px",borderRadius:14,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.textSec,fontWeight:600})},
              "Retour"
            )
          )
        )
      ),

      /* SESSION (main cockpit) */
      phase === "session" && React.createElement("div", {style:{position:"relative",zIndex:1}},
        /* HEADER */
        React.createElement("header", {style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",borderBottom:"1px solid " + T.border,background:isDark ? T.surface + "dd" : T.surface + "ee",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100,gap:12,flexWrap:"wrap"}},
          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:12}},
            React.createElement("span", {style:{fontSize:22}}, "🎬"),
            React.createElement("div", null,
              React.createElement("div", {style:{fontSize:15,fontWeight:800,color:T.accent}}, "BANLIEUWOOD"),
              React.createElement("div", {style:{fontSize:10,color:T.textMut}}, cls ? cls.name : "" + " — " + ("P" + mod.phase + " " + mod.name))
            )
          ),

          React.createElement("div", {className:"hcenter",style:{display:"flex",alignItems:"center",gap:14}},
            React.createElement("div", {style:{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:sessionOn ? T.green + "15" : T.surfaceAlt,border:"1px solid " + (sessionOn ? T.green + "44" : T.border)},role:"status","aria-live":"polite"},
              React.createElement("span", {style:{width:7,height:7,borderRadius:"50%",background:sessionOn ? T.green : T.textMut}}),
              React.createElement("span", {style:{fontSize:11,fontWeight:600,color:sessionOn ? T.green : T.textMut}}, sessionOn ? "LIVE" : "PAUSE")
            ),
            React.createElement(Tip, {text:"Temps ecoule"},
              React.createElement("span", {style:{fontFamily:"monospace",fontWeight:700,fontSize:13}},
                React.createElement(Timer, {size:13,style:{marginRight:4,verticalAlign:"middle"}}),
                fmtT(elapsed)
              )
            ),
            React.createElement(Tip, {text:activeCount + " connectes, " + disconnCount + " deconnectes"},
              React.createElement("span", {style:{fontSize:13}},
                React.createElement(Users, {size:13,style:{marginRight:4,verticalAlign:"middle"}}),
                React.createElement("strong", null, activeCount),
                React.createElement("span", {style:{color:T.textMut}}, "/" + STUDENTS.length)
              )
            ),
            handRaisedCount > 0 && React.createElement(Tip, {text:handRaisedCount + " mains levees"},
              React.createElement("span", {style:{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,background:T.gold + "20",border:"1px solid " + T.gold + "44",animation:"breathe 2s ease infinite",fontSize:12,fontWeight:700,color:T.gold}},
                "✋ ",
                handRaisedCount
              )
            ),
            React.createElement(Tip, {text:disconnCount > 3 ? "Reseau degrade" : "Reseau stable"},
              disconnCount > 3 ? React.createElement(SignalLow, {size:14,color:T.orange}) : React.createElement(Signal, {size:14,color:T.green})
            ),
            React.createElement(Tip, {text:"Temps restant session"},
              React.createElement("span", {style:{fontSize:13,fontFamily:"monospace",color:globalTimer < 180 ? T.red : T.green}},
                React.createElement(Clock, {size:13,style:{marginRight:4,verticalAlign:"middle"}}),
                fmtT(globalTimer)
              )
            )
          ),

          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:6}},
            React.createElement(Tip, {text:"Cmd+K"},
              React.createElement("button", {onClick:function(){setCmdOpen(true);},title:"Commandes",style:Object.assign({}, bs, touch, {display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,background:T.surfaceAlt,border:"1px solid " + T.border,color:T.textSec,fontSize:12})},
                React.createElement(Search, {size:14}),
                "⌘K"
              )
            ),
            React.createElement("select", {value:selModule,onChange:function(e){setSelModule(Number(e.target.value));},style:{padding:"6px 10px",borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.text,fontSize:11,fontFamily:"inherit",cursor:"pointer"},title:"Module rapide"},
              MODULES.map(function(m, i) {
                return React.createElement("option", {key:m.id,value:i}, m.icon + " P" + m.phase + " " + m.name);
              })
            ),
            React.createElement(Tip, {text:sessionOn ? "Pause" : "Reprendre"},
              React.createElement("button", {onClick:function(){setSessionOn(!sessionOn);},style:Object.assign({}, bs, touch, {padding:"8px 16px",borderRadius:10,color:"#fff",fontWeight:600,fontSize:13,background:sessionOn ? "linear-gradient(135deg," + T.orange + ",#ea580c)" : "linear-gradient(135deg," + T.green + ",#059669)"})},
                sessionOn ? React.createElement(React.Fragment, null, React.createElement(Pause, {size:14}), " Pause") : React.createElement(React.Fragment, null, React.createElement(Play, {size:14}), " Go")
              )
            ),
            React.createElement(Tip, {text:isDark ? "Mode clair" : "Mode sombre"},
              React.createElement("button", {onClick:function(){setIsDark(!isDark);},style:Object.assign({}, bs, touch, {width:44,height:44,borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"})},
                isDark ? React.createElement(Sun, {size:16}) : React.createElement(Moon, {size:16})
              )
            ),
            React.createElement(Tip, {text:"Panneau lateral"},
              React.createElement("button", {onClick:function(){setSideOpen(!sideOpen);},style:Object.assign({}, bs, touch, {width:44,height:44,borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"})},
                sideOpen ? React.createElement(PanelRightClose, {size:16}) : React.createElement(PanelRight, {size:16})
              )
            )
          )
        ),

        /* MODULE RAIL */
        React.createElement("nav", {style:{display:"flex",gap:4,padding:"10px 20px",overflowX:"auto",borderBottom:"1px solid " + T.border,background:isDark ? T.surface + "99" : T.surface}},
          MODULES.map(function(m, i) {
            var act = selModule === i;
            var done = i < selModule;
            var locked = i > selModule + 1;
            var prog = MODULE_PROGRESS[i];
            return React.createElement("div", {key:m.id,style:{display:"flex",alignItems:"center"}},
              i > 0 && React.createElement("div", {style:{width:16,height:2,background:done ? T.green : T.border,marginRight:4,borderRadius:1},role:"presentation"}),
              React.createElement(Tip, {text:MODULE_OBJECTIVES[i]},
                React.createElement("button", {onClick:function(){if (!locked) setSelModule(i);},title:MODULE_OBJECTIVES[i],style:Object.assign({}, bs, touch, {display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,whiteSpace:"nowrap",border:"1.5px solid " + (act ? m.color + "88" : done ? T.green + "44" : T.border),background:act ? m.color + "15" : done ? T.green + "08" : "transparent",color:act ? m.color : done ? T.green : locked ? T.textMut : T.textMut,fontWeight:act ? 700 : 500,fontSize:12,opacity:locked ? 0.5 : 1,cursor:locked ? "not-allowed" : "pointer",position:"relative"})},
                  React.createElement("span", null, locked ? "🔒" : done ? "✅" : m.icon),
                  "P" + m.phase,
                  prog > 0 && prog < 100 && React.createElement("span", {style:{fontSize:9,color:act ? m.color : T.textMut,fontWeight:700}}, prog + "%")
                )
              )
            );
          })
        ),

        /* MAIN GRID */
        React.createElement("div", {className:"mgrid",style:{display:"grid",gridTemplateColumns:sideOpen ? "1fr 360px" : "1fr",minHeight:"calc(100vh - 110px)"}},
          React.createElement("main", {style:{padding:20,display:"flex",flexDirection:"column",gap:16}},
            /* MODULE SECTION */
            React.createElement("section", {style:{background:T.card,border:"1px solid " + T.border,borderRadius:16,overflow:"hidden"}},
              React.createElement("div", {style:{height:4,background:"linear-gradient(90deg," + mod.color + "," + mod.color + "66)"}}),
              React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap",padding:"20px 22px"}},
                React.createElement("div", {style:{flex:1,minWidth:260}},
                  React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8,marginBottom:8}},
                    React.createElement("span", {style:{fontSize:28}}, mod.icon),
                    React.createElement("div", null,
                      React.createElement("div", {style:{fontSize:11,fontWeight:600,color:mod.color,textTransform:"uppercase",letterSpacing:".08em"}}, "Phase " + mod.phase + " — Manche " + manche + "/8"),
                      React.createElement("h1", {style:{fontSize:20,fontWeight:800,margin:0}}, mod.name)
                    )
                  ),
                  React.createElement("p", {style:{fontSize:13,color:T.textSec,lineHeight:1.6,maxWidth:480}},
                    manche <= 2 ? "Les eleves votent pour leur histoire preferee." : manche <= 5 ? "Les propositions les plus faibles sont eliminees." : "Dernieres manches — le choix final approche !"
                  )
                )
              ),
              React.createElement(ModuleContent, {T:T,mod:mod,currentImageIdx:currentImageIdx,onImageNext:onImageNext,onImagePrev:onImagePrev,currentQuizIdx:currentQuizIdx,onQuizNext:onQuizNext,voteData:voteData,totalVotes:totalVotes,sorted:sorted,currentPromptIdx:currentPromptIdx,onPromptNext:function(){if(currentPromptIdx < WRITING_PROMPTS.length - 1) setCurrentPromptIdx(currentPromptIdx + 1);},onPromptPrev:function(){if(currentPromptIdx > 0) setCurrentPromptIdx(currentPromptIdx - 1);},pitchTimer:pitchTimer,pitchRunning:pitchRunning,onPitchStart:function(){if(pitchRunning){setPitchRunning(false);}else{setPitchTimer(30);setPitchRunning(true);}},onPitchNext:function(){setPitchRunning(false);setPitchTimer(30);},quizTimer:quizTimer,quizRevealed:quizRevealed,onToggleQuizReveal:function(){setQuizRevealed(!quizRevealed);},storyFrames:storyFrames,onProject:function(view){setProjView(view);setShowProjection(true);},onVoteReset:function(){setVoteData(VOTE_OPTS);}})
            ),

            /* PROJECTION & SESSION PANELS */
            React.createElement("div", {className:"sgrid",style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}},
              /* PROJECTION CONTROL */
              React.createElement("section", {style:{background:T.card,border:"1px solid " + T.border,borderRadius:16,padding:16}},
                React.createElement("h3", {style:{fontSize:14,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:8}},
                  React.createElement(Monitor, {size:16,color:T.accent}),
                  "Ecran Projection"
                ),
                React.createElement("div", {style:{display:"flex",gap:8,marginBottom:12}},
                  React.createElement("button", {onClick:function(){setShowProjection(!showProjection);},style:Object.assign({}, bs, touch, {flex:1,padding:"8px 12px",borderRadius:10,fontSize:12,fontWeight:600,background:showProjection ? T.accent : T.surfaceAlt,color:showProjection ? "#fff" : T.text,border:"1px solid " + (showProjection ? T.accent : T.border)})},
                    showProjection ? "Actif" : "Inactif"
                  ),
                  React.createElement(Tip, {text:"Ouvrir dans nouvel onglet"},
                    React.createElement("button", {onClick:function(){window.open("about:blank");},style:Object.assign({}, bs, touch, {width:36,height:36,borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12})},
                      React.createElement(ExternalLink, {size:14})
                    )
                  )
                ),
                React.createElement("div", {style:{width:"100%",height:60,borderRadius:8,background:"linear-gradient(135deg," + T.accent + "11," + T.pink + "11)",border:"1px solid " + T.border,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:T.textMut}}, "Apercu: " + projView),
                React.createElement("select", {value:projView,onChange:function(e){setProjView(e.target.value);},style:{width:"100%",padding:"8px 12px",borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.text,fontSize:12,marginBottom:8,fontFamily:"inherit"}},
                  React.createElement("option", {value:"vote"}, "Vote en direct"),
                  React.createElement("option", {value:"result"}, "Resultat"),
                  React.createElement("option", {value:"qr"}, "QR Code"),
                  React.createElement("option", {value:"consigne"}, "Consigne"),
                  React.createElement("option", {value:"waiting"}, "Attente"),
                  React.createElement("option", {value:"black"}, "Mode Noir"),
                  React.createElement("option", {value:"bracket"}, "Bracket"),
                  React.createElement("option", {value:"debate"}, "Debat"),
                  React.createElement("option", {value:"quiz"}, "Quiz Geant"),
                  React.createElement("option", {value:"image"}, "Image Plein Ecran"),
                  React.createElement("option", {value:"writing"}, "Ecriture"),
                  React.createElement("option", {value:"pitch"}, "Pitch Countdown")
                ),
                React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8,marginBottom:8}},
                  React.createElement("button", {onClick:function(){setProjAutoSync(!projAutoSync);},style:Object.assign({}, bs, {padding:"4px 10px",borderRadius:8,background:projAutoSync ? T.green + "15" : T.surfaceAlt,border:"1px solid " + (projAutoSync ? T.green + "44" : T.border),color:projAutoSync ? T.green : T.textMut,fontSize:10,fontWeight:600,display:"flex",alignItems:"center",gap:4})},
                    projAutoSync ? React.createElement(Check, {size:10}) : React.createElement(X, {size:10}),
                    "Auto-sync"
                  ),
                  React.createElement("span", {style:{fontSize:9,color:T.textMut}}, projAutoSync ? "Suit le module actif" : "Manuel")
                ),
                projView === "consigne" && React.createElement("textarea", {value:consigneText,onChange:function(e){setConsigneText(e.target.value);},placeholder:"Entrez une consigne...",style:{width:"100%",padding:"8px 12px",borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.text,fontSize:12,fontFamily:"inherit",resize:"vertical",minHeight:80}}),
                React.createElement("button", {onClick:function(){setProjView("black");},style:Object.assign({}, bs, touch, {width:"100%",padding:"8px 12px",borderRadius:10,background:T.red + "15",border:"1px solid " + T.red + "44",color:T.red,fontSize:12,fontWeight:600,marginTop:8})},
                  React.createElement(Lock, {size:12,style:{marginRight:4,verticalAlign:"middle"}}),
                  "Mode Noir"
                )
              ),

              /* SESSION NOTES & TIMER */
              React.createElement("section", {style:{background:T.card,border:"1px solid " + T.border,borderRadius:16,padding:16}},
                React.createElement("h3", {style:{fontSize:14,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:8}},
                  React.createElement(MessageSquare, {size:16,color:T.accent}),
                  "Notes & Gestion"
                ),
                React.createElement("textarea", {value:sessionNotes,onChange:function(e){setSessionNotes(e.target.value);},placeholder:"Notes de session...",style:{width:"100%",padding:"8px 12px",borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.text,fontSize:12,fontFamily:"inherit",resize:"vertical",minHeight:80,marginBottom:12}}),
                React.createElement("div", {style:{display:"flex",gap:8}},
                  React.createElement("button", {onClick:function(){setProjView("black");},style:Object.assign({}, bs, touch, {flex:1,padding:"8px 12px",borderRadius:10,background:T.gold + "15",border:"1px solid " + T.gold + "44",color:T.gold,fontSize:12,fontWeight:600})},
                    React.createElement(Maximize, {size:12,style:{marginRight:4,verticalAlign:"middle"}}),
                    "Verrou ecrans"
                  ),
                  React.createElement("button", {onClick:function(){setShowConfirm("endSession");},style:Object.assign({}, bs, touch, {flex:1,padding:"8px 12px",borderRadius:10,background:T.red + "15",border:"1px solid " + T.red + "44",color:T.red,fontSize:12,fontWeight:600})},
                    React.createElement(X, {size:12,style:{marginRight:4,verticalAlign:"middle"}}),
                    "Terminer"
                  )
                )
              )
            ),

            /* VOTE CONTROLS */
            React.createElement("section", {style:{background:T.card,border:"1px solid " + T.border,borderRadius:16,padding:20}},
              React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
                React.createElement("h3", {style:{fontSize:15,fontWeight:700}}, "Controles Vote"),
                React.createElement("div", {style:{display:"flex",alignItems:"center",gap:8}},
                  voteState === "open" && React.createElement("span", {style:{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:8,background:T.green + "15",color:T.green,animation:"shimmer 1.5s ease infinite"}}, totalVotes + " votes"),
                  React.createElement("span", {style:{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:8,background:voteState === "open" ? T.green + "15" : voteState === "revealed" ? T.gold + "15" : T.surfaceAlt,color:voteState === "open" ? T.green : voteState === "revealed" ? T.gold : T.textMut}}, voteState === "open" ? "Ouvert" : voteState === "revealed" ? "Revele" : voteState === "revealing" ? "Revelation..." : "Ferme"),
                  React.createElement("button", {onClick:function(){setVoteData(VOTE_OPTS);},style:Object.assign({}, bs, {padding:"4px 8px",borderRadius:6,background:T.surfaceAlt,border:"1px solid " + T.border,color:T.textMut,fontSize:10,display:"flex",alignItems:"center",gap:4})},
                    React.createElement(RefreshCw, {size:10}),
                    "Reset"
                  )
                )
              ),
              React.createElement("div", {style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}},
                React.createElement("button", {onClick:openVote,disabled:voteState === "open",style:Object.assign({}, bs, touch, {padding:"12px 16px",borderRadius:12,background:voteState === "open" ? T.accent + "20" : T.accent,color:voteState === "open" ? T.accent : "#fff",fontSize:13,fontWeight:700,opacity:voteState === "open" ? 0.6 : 1})},
                  React.createElement(Play, {size:14,style:{marginRight:4,verticalAlign:"middle"}}),
                  "Ouvrir"
                ),
                React.createElement("button", {onClick:closeVote,disabled:voteState !== "open",style:Object.assign({}, bs, touch, {padding:"12px 16px",borderRadius:12,background:voteState !== "open" ? T.border : T.orange,color:voteState !== "open" ? T.textMut : "#fff",fontSize:13,fontWeight:700,opacity:voteState !== "open" ? 0.6 : 1})},
                  React.createElement(Pause, {size:14,style:{marginRight:4,verticalAlign:"middle"}}),
                  "Fermer"
                ),
                React.createElement("button", {onClick:startReveal,disabled:voteState !== "closed",style:Object.assign({}, bs, touch, {padding:"12px 16px",borderRadius:12,background:voteState !== "closed" ? T.border : T.pink,color:voteState !== "closed" ? T.textMut : "#fff",fontSize:13,fontWeight:700,opacity:voteState !== "closed" ? 0.6 : 1})},
                  React.createElement(Sparkles, {size:14,style:{marginRight:4,verticalAlign:"middle"}}),
                  "Reveler"
                ),
                React.createElement("button", {onClick:nextManche,disabled:voteState !== "revealed",style:Object.assign({}, bs, touch, {padding:"12px 16px",borderRadius:12,background:voteState !== "revealed" ? T.border : T.green,color:voteState !== "revealed" ? T.textMut : "#fff",fontSize:13,fontWeight:700,opacity:voteState !== "revealed" ? 0.6 : 1})},
                  React.createElement(SkipForward, {size:14,style:{marginRight:4,verticalAlign:"middle"}}),
                  "Suivant"
                )
              )
            ),

            /* NOTIFICATIONS */
            React.createElement("section", {style:{background:T.card,border:"1px solid " + T.border,borderRadius:16,padding:20}},
              React.createElement("div", {style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}},
                React.createElement("div", {style:{display:"flex",alignItems:"center",gap:10}},
                  React.createElement("span", {style:{fontSize:18}}, "📻"),
                  React.createElement("span", {style:{fontSize:13,fontWeight:700}}, "Activite"),
                  React.createElement("span", {style:{fontSize:10,padding:"2px 8px",borderRadius:10,background:T.accent + "15",color:T.accent,fontWeight:600}}, notifs.length)
                ),
                React.createElement("div", {style:{display:"flex",gap:6}},
                  React.createElement("button", {onClick:function(){setNotifSound(!notifSound);},style:Object.assign({}, bs, {padding:"4px 8px",borderRadius:6,background:T.surfaceAlt,border:"1px solid " + T.border,color:notifSound ? T.green : T.textMut,fontSize:10,display:"flex",alignItems:"center",gap:4})},
                    notifSound ? React.createElement(Volume2, {size:10}) : React.createElement(VolumeX, {size:10}),
                    notifSound ? "Son" : "Muet"
                  ),
                  React.createElement("button", {onClick:function(){setNotifs([]);},style:Object.assign({}, bs, {padding:"4px 8px",borderRadius:6,background:T.red + "10",border:"1px solid " + T.red + "33",color:T.red,fontSize:10,fontWeight:600})}, "Effacer tout")
                )
              ),
              React.createElement("div", {role:"log","aria-live":"polite",style:{display:"flex",flexDirection:"column",gap:4}},
                notifs.slice(0, 5).map(function(n, i) {
                  return React.createElement("div", {key:n.id,style:{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:T.surfaceAlt,animation:i === 0 ? "slideUp .3s" : "none",borderLeft:"3px solid " + (n.cat === "vote" ? T.gold : n.cat === "achievement" ? T.pink : T.accent),fontSize:12}},
                    React.createElement("span", null, n.icon),
                    React.createElement("span", {style:{flex:1}}, n.text),
                    React.createElement("span", {style:{color:T.textMut,fontSize:10}}, n.time)
                  );
                })
              )
            ),

            /* SHORTCUTS */
            React.createElement("div", {style:{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"8px 0",color:T.textMut,fontSize:10}},
              React.createElement(Keyboard, {size:11}),
              [{k:"⌘K",l:"Commandes"},{k:"Space",l:"Pause"},{k:"Esc",l:"Fermer"}].map(function(s, i) {
                return React.createElement("span", {key:i},
                  React.createElement("kbd", {style:{padding:"1px 5px",borderRadius:4,fontSize:9,background:T.surfaceAlt,border:"1px solid " + T.border,fontFamily:"monospace"}}, s.k),
                  " ",
                  s.l
                );
              })
            )
          ),

          /* SIDEBAR */
          sideOpen && React.createElement("aside", {className:"side",style:{borderLeft:"1px solid " + T.border,background:isDark ? T.surface + "ee" : T.surface,display:"flex",flexDirection:"column",height:"calc(100vh - 110px)",position:"sticky",top:110}},
            React.createElement("div", {style:{display:"flex",borderBottom:"1px solid " + T.border}},
              [{id:"students",l:"Eleves",ic:React.createElement(Users, {size:13})},{id:"responses",l:"Reponses",ic:React.createElement(MessageSquare, {size:13})},{id:"timeline",l:"Timeline",ic:React.createElement(Clock, {size:13})},{id:"notes",l:"Notes",ic:React.createElement(MessageSquare, {size:13})}].map(function(t) {
                return React.createElement("button", {key:t.id,onClick:function(){setSideTab(t.id);},style:Object.assign({}, bs, touch, {flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"10px 6px",fontSize:11,fontWeight:600,background:"transparent",color:sideTab === t.id ? T.accent : T.textMut,borderBottom:"2px solid " + (sideTab === t.id ? T.accent : "transparent")})},
                  t.ic,
                  " ",
                  t.l
                );
              })
            ),

            sideTab === "students" && React.createElement("div", {style:{padding:"8px 10px",borderBottom:"1px solid " + T.border}},
              React.createElement("div", {style:{position:"relative",marginBottom:6}},
                React.createElement(Search, {size:12,style:{position:"absolute",left:8,top:8,color:T.textMut}}),
                React.createElement("input", {value:studentSearch,onChange:function(e){setStudentSearch(e.target.value);},placeholder:"Chercher un eleve...",style:{width:"100%",padding:"6px 8px 6px 26px",borderRadius:8,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.text,fontSize:11,fontFamily:"inherit",outline:"none"}})
              ),
              React.createElement("div", {style:{display:"flex",gap:4,overflowX:"auto"}},
                [{id:"all",l:"Tous (" + STUDENTS.length + ")"},{id:"active",l:"Actifs (" + activeCount + ")"},{id:"idle",l:"Idle (" + idleCount + ")"},{id:"disconnected",l:"Off (" + disconnCount + ")"},{id:"responding",l:"Ecrivent (" + respondCount + ")"},{id:"handsup",l:"Mains (" + handRaisedCount + ")"}].map(function(f) {
                  return React.createElement("button", {key:f.id,onClick:function(){setFilter(f.id);},style:Object.assign({}, bs, {padding:"4px 10px",borderRadius:8,fontSize:10,fontWeight:600,whiteSpace:"nowrap",background:filter === f.id ? T.accent + "15" : "transparent",color:filter === f.id ? T.accent : T.textMut,border:"1px solid " + (filter === f.id ? T.accent + "44" : "transparent")})},
                    f.l
                  );
                })
              )
            ),

            React.createElement("div", {style:{flex:1,overflowY:"auto",padding:8}},
              sideTab === "students" && filtered.map(function(s) {
                var sel = selStudent === s.id;
                var sc = s.status === "active" ? T.green : s.status === "idle" ? T.orange : T.red;
                return React.createElement("div", {key:s.id},
                  React.createElement("button", {onClick:function(){setSelStudent(sel ? null : s.id);},title:sel ? "Collapse" : "Expand",style:Object.assign({}, bs, {width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 8px",borderRadius:10,textAlign:"left",background:sel ? T.accent + "12" : "transparent",border:"1px solid " + (sel ? T.accent + "33" : "transparent"),color:T.text})},
                    React.createElement("div", {style:{width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:sc + "12",border:"2px solid " + sc + "33",position:"relative",flexShrink:0}},
                      s.avatar,
                      s.responding && React.createElement("div", {style:{position:"absolute",bottom:-2,right:-2,width:12,height:12,borderRadius:"50%",background:T.green,border:"2px solid " + T.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}, "✏️"),
                      s.hasError && React.createElement("div", {style:{position:"absolute",top:-2,left:-2,width:12,height:12,borderRadius:"50%",background:T.red,border:"2px solid " + T.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}, "⚠️"),
                      s.handRaised && React.createElement("div", {style:{position:"absolute",top:-2,right:-2,width:14,height:14,borderRadius:"50%",background:T.gold,border:"2px solid " + T.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}, "✋")
                    ),
                    React.createElement("div", {style:{flex:1,minWidth:0}},
                      React.createElement("div", {style:{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}},
                        React.createElement("span", {style:{fontSize:12,fontWeight:600}}, s.name),
                        s.streak >= 5 && React.createElement("span", {style:{fontSize:9}}, "🔥"),
                        s.tags.map(function(t) {
                          return React.createElement("span", {key:t,style:{fontSize:8,padding:"1px 5px",borderRadius:6,background:t === "leader" ? T.gold + "15" : T.accent + "15",color:t === "leader" ? T.gold : T.accent,fontWeight:600}}, t);
                        })
                      ),
                      React.createElement("div", {style:{display:"flex",alignItems:"center",gap:4,marginTop:2}},
                        React.createElement("span", {style:{fontSize:9,color:s.level.color}}, s.level.icon),
                        React.createElement("div", {style:{flex:1,height:3,borderRadius:2,background:T.surfaceAlt,overflow:"hidden"}},
                          React.createElement("div", {style:{height:"100%",width:((s.xp - s.level.min) / (s.level.max - s.level.min)) * 100 + "%",background:s.level.color,borderRadius:2}})
                        ),
                        React.createElement("span", {style:{fontSize:9,color:T.textMut}}, s.xp + "XP")
                      )
                    ),
                    React.createElement("span", {style:{width:7,height:7,borderRadius:"50%",background:sc,flexShrink:0}})
                  ),

                  sel && React.createElement("div", {style:{margin:"2px 0 6px",padding:12,borderRadius:10,background:T.surfaceAlt,border:"1px solid " + T.border,animation:"slideUp .2s ease",fontSize:12}},
                    React.createElement("div", {style:{display:"flex",justifyContent:"space-between",marginBottom:8}},
                      React.createElement("span", {style:{fontWeight:700}}, s.name),
                      React.createElement("span", {style:{color:s.level.color,fontWeight:600}}, s.level.icon + " " + s.level.name)
                    ),
                    React.createElement("div", {style:{color:T.textSec,marginBottom:4}}, "XP: " + s.xp + "/" + s.level.max + " — Serie: " + s.streak + " " + (s.streak >= 5 ? "🔥" : "")),
                    React.createElement("div", {style:{color:T.textSec,marginBottom:4}},
                      "Statut: ",
                      React.createElement("span", {style:{color:sc}}, s.status),
                      s.status === "idle" && s.idleSince ? " (inactif " + Math.round((Date.now() - s.idleSince) / 60000) + " min)" : "",
                      s.reconnects > 0 ? " — " + s.reconnects + " reconnexions" : ""
                    ),
                    s.lastResponse && React.createElement("div", {style:{marginTop:6,padding:"6px 10px",borderRadius:6,background:T.card,border:"1px solid " + T.border,fontStyle:"italic",lineHeight:1.5}}, "\"" + s.lastResponse + "\""),

                    React.createElement("div", {style:{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}},
                      React.createElement("button", {onClick:function(){setMsgModal({studentId:s.id,type:"encourage"});},style:Object.assign({}, bs, {flex:1,padding:"6px 10px",borderRadius:8,background:T.green + "15",border:"1px solid " + T.green + "33",color:T.green,fontSize:11,fontWeight:600})},
                        "👏 Encourager"
                      ),
                      React.createElement("button", {onClick:function(){setMsgModal({studentId:s.id,type:"relance"});},style:Object.assign({}, bs, {flex:1,padding:"6px 10px",borderRadius:8,background:T.orange + "15",border:"1px solid " + T.orange + "33",color:T.orange,fontSize:11,fontWeight:600})},
                        "🔔 Relancer"
                      ),
                      React.createElement("button", {onClick:function(){setNotifs(function(p){ return [{id:Date.now(),text:s.name + " +10 XP",time:"now",icon:"⚡",cat:"achievement"}].concat(p.slice(0, 6)); });},style:Object.assign({}, bs, {flex:1,padding:"6px 10px",borderRadius:8,background:T.gold + "15",border:"1px solid " + T.gold + "33",color:T.gold,fontSize:11,fontWeight:600})},
                        "⚡ +10XP"
                      )
                    )
                  )
                );
              }),

              sideTab === "responses" && React.createElement("div", {style:{padding:8}},
                React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
                  React.createElement("div", {style:{display:"flex",gap:4}},
                    [{id:"all",l:"Toutes (" + ALL_RESPONSES.length + ")"},{id:"pending",l:"A valider"},{id:"validated",l:"Validees"},{id:"flagged",l:"Signalees"}].map(function(f) {
                      return React.createElement("button", {key:f.id,onClick:function(){setResponsesFilter(f.id);},style:Object.assign({}, bs, {padding:"4px 8px",borderRadius:6,fontSize:9,fontWeight:600,background:responsesFilter === f.id ? T.accent + "15" : "transparent",color:responsesFilter === f.id ? T.accent : T.textMut,border:"1px solid " + (responsesFilter === f.id ? T.accent + "44" : T.border)})}, f.l);
                    })
                  ),
                  React.createElement("span", {style:{fontSize:9,color:T.textMut}}, filteredResponses.length + " reponses")
                ),
                filteredResponses.map(function(resp) {
                  var statusColor = resp.status === "validated" ? T.green : resp.status === "flagged" ? T.red : T.orange;
                  return React.createElement("div", {key:resp.id,style:{padding:10,borderRadius:10,background:T.card,border:"1px solid " + T.border,marginBottom:6,borderLeft:"3px solid " + statusColor}},
                    React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}},
                      React.createElement("div", {style:{display:"flex",alignItems:"center",gap:6}},
                        React.createElement("span", {style:{fontSize:11,fontWeight:700}}, resp.student),
                        React.createElement("span", {style:{fontSize:9,padding:"1px 6px",borderRadius:4,background:T.surfaceAlt,color:T.textMut}}, resp.phase),
                        resp.starred && React.createElement("span", {style:{fontSize:10}}, "⭐")
                      ),
                      React.createElement("span", {style:{fontSize:9,color:T.textMut}}, resp.time)
                    ),
                    React.createElement("div", {style:{fontSize:11,color:T.textSec,lineHeight:1.5,marginBottom:6}}, resp.text),
                    React.createElement("div", {style:{display:"flex",gap:4}},
                      React.createElement("button", {style:{border:"none",cursor:"pointer",padding:"3px 8px",borderRadius:6,background:T.green + "15",color:T.green,fontSize:9,fontWeight:600}}, "Valider"),
                      React.createElement("button", {style:{border:"none",cursor:"pointer",padding:"3px 8px",borderRadius:6,background:T.red + "15",color:T.red,fontSize:9,fontWeight:600}}, "Signaler"),
                      React.createElement("button", {style:{border:"none",cursor:"pointer",padding:"3px 8px",borderRadius:6,background:T.surfaceAlt,color:T.textMut,fontSize:9,fontWeight:600}}, "Masquer"),
                      React.createElement("button", {style:{border:"none",cursor:"pointer",padding:"3px 8px",borderRadius:6,background:T.accent + "15",color:T.accent,fontSize:9,fontWeight:600}}, "Projeter")
                    )
                  );
                })
              ),

              sideTab === "notes" && React.createElement("div", {style:{padding:12}},
                React.createElement("div", {style:{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}},
                  React.createElement("button", {onClick:function(){setSessionNotes(function(n){ return n + "\n[" + fmtT(elapsed) + "] "; });},style:{border:"none",cursor:"pointer",padding:"4px 10px",borderRadius:6,background:T.surfaceAlt,color:T.textSec,fontSize:10,fontWeight:600,display:"flex",alignItems:"center",gap:4}},
                    React.createElement(Clock, {size:10}),
                    "Horodater"
                  ),
                  NOTE_TAGS.map(function(tag) {
                    return React.createElement("button", {key:tag.id,onClick:function(){setSessionNotes(function(n){ return n + "\n[" + tag.label + "] "; });},style:{border:"none",cursor:"pointer",padding:"4px 10px",borderRadius:6,background:tag.color + "15",color:tag.color,fontSize:10,fontWeight:600}}, tag.label);
                  })
                ),
                React.createElement("textarea", {value:sessionNotes,onChange:function(e){setSessionNotes(e.target.value);},placeholder:"Notes de session detaillees...",style:{width:"100%",padding:"8px 12px",borderRadius:10,border:"1px solid " + T.border,background:T.surfaceAlt,color:T.text,fontSize:12,fontFamily:"inherit",resize:"vertical",minHeight:200}})
              ),

              sideTab === "timeline" && React.createElement("div", {style:{padding:8}},
                mancheHist.map(function(m) {
                  return React.createElement("div", {key:m.round,style:{padding:10,borderRadius:10,background:T.surfaceAlt,marginBottom:8,fontSize:11}},
                    React.createElement("div", {style:{fontWeight:700,marginBottom:4}}, "Manche " + m.round),
                    React.createElement("div", {style:{color:T.green}}, "🎉 " + m.winner + " (" + m.winPct + "%)"),
                    React.createElement("div", {style:{color:T.red}}, "❌ " + m.eliminated + " (" + m.pct + "%)")
                  );
                })
              )
            )
          )
        )
      ),

      /* CONFIRMATION MODALS */
      showConfirm && React.createElement("div", {style:{position:"fixed",inset:0,zIndex:9997,background:"#0008",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:function(){setShowConfirm(null);}},
        React.createElement("div", {onClick:function(e){e.stopPropagation();},style:{background:T.surface,border:"1px solid " + T.border,borderRadius:16,padding:24,maxWidth:400,width:"90%",boxShadow:"0 16px 48px #00000044"}},
          React.createElement("div", {style:{fontSize:16,fontWeight:700,marginBottom:12}},
            showConfirm === "close" ? "Fermer le vote ?" : showConfirm === "next" ? "Passer a la manche suivante ?" : "Terminer la seance ?"
          ),
          React.createElement("p", {style:{color:T.textSec,fontSize:13,marginBottom:20}},
            showConfirm === "close" ? "Les eleves ne pourront plus voter." : showConfirm === "next" ? "L'option eliminee : " + sorted[sorted.length - 1].text : "Aucun retour possible."
          ),
          React.createElement("div", {style:{display:"flex",gap:10}},
            React.createElement("button", {onClick:function(){setShowConfirm(null);},style:Object.assign({}, bs, {padding:"10px 20px",borderRadius:10,border:"1px solid " + T.border,background:"transparent",color:T.textMut,fontSize:13,fontWeight:700,flex:1})},
              "Annuler"
            ),
            React.createElement("button", {onClick:showConfirm === "close" ? confirmCloseVote : showConfirm === "next" ? confirmNext : endSession,style:Object.assign({}, bs, {padding:"10px 20px",borderRadius:10,background:T.accent,color:"#fff",fontSize:13,fontWeight:700,flex:1})},
              "Confirmer"
            )
          )
        )
      ),

      /* MSG MODAL */
      msgModal && React.createElement("div", {style:{position:"fixed",inset:0,zIndex:9997,background:"#0008",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:function(){setMsgModal(null);}},
        React.createElement("div", {onClick:function(e){e.stopPropagation();},style:{background:T.surface,border:"1px solid " + T.border,borderRadius:16,padding:24,maxWidth:380,width:"90%",boxShadow:"0 16px 48px #00000044"}},
          React.createElement(MsgModalBody, {T:T,studentId:msgModal.studentId,type:msgModal.type,onSend:handleMsgSend,onClose:function(){setMsgModal(null);}})
        )
      ),

      /* CMD PALETTE */
      cmdOpen && React.createElement("div", {style:{position:"fixed",inset:0,zIndex:9996,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:100,background:"#0006",backdropFilter:"blur(8px)",animation:"fadeIn .15s ease"},onClick:function(e){if (e.target === e.currentTarget) setCmdOpen(false);}},
        React.createElement("div", {style:{width:"100%",maxWidth:540,background:T.surface,border:"1px solid " + T.border,borderRadius:16,boxShadow:"0 24px 64px #00000055",overflow:"hidden"}},
          React.createElement("div", {style:{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:"1px solid " + T.border}},
            React.createElement(Search, {size:18,color:T.textMut}),
            React.createElement("input", {autoFocus:true,value:cmdQ,onChange:function(e){setCmdQ(e.target.value);},placeholder:"Commande...",title:"Recherche",style:{flex:1,background:"none",border:"none",color:T.text,fontSize:15,fontFamily:"inherit",outline:"none"}}),
            React.createElement("kbd", {style:{padding:"2px 8px",borderRadius:6,fontSize:11,fontFamily:"monospace",background:T.surfaceAlt,color:T.textMut,border:"1px solid " + T.border}}, "ESC")
          ),
          React.createElement("div", {style:{maxHeight:300,overflowY:"auto",padding:6}},
            [{l:"Ouvrir le vote",ic:"🗳️",a:openVote},{l:"Fermer le vote",ic:"🔒",a:closeVote},{l:"Reveler les resultats",ic:"✨",a:startReveal},{l:"Manche suivante",ic:"⏭️",a:nextManche},{l:"Pause / Reprendre",ic:"⏯️",a:function(){setSessionOn(function(s){return !s;});}},{l:"Terminer la seance",ic:"🏁",a:endSession},{l:"Mode " + (isDark ? "clair" : "sombre"),ic:isDark ? "☀️" : "🌙",a:function(){setIsDark(function(d){return !d;});}},{l:"P1 Ideation",ic:"💡",a:function(){setSelModule(0);}},{l:"P2 Ecriture",ic:"✏️",a:function(){setSelModule(1);}},{l:"P3 Decouverte",ic:"🎬",a:function(){setSelModule(2);}},{l:"P4 Tournage",ic:"🎥",a:function(){setSelModule(3);}},{l:"P5 Vote Final",ic:"🏆",a:function(){setSelModule(4);}},{l:"P6 Montage",ic:"✂️",a:function(){setSelModule(5);}},{l:"P7 Projection",ic:"🎬️",a:function(){setSelModule(6);}},{l:"P8 Festival",ic:"⭐",a:function(){setSelModule(7);}},{l:"Projeter Quiz",ic:"📊",a:function(){setProjView("quiz");setShowProjection(true);}},{l:"Projeter Image",ic:"🖼️",a:function(){setProjView("image");setShowProjection(true);}},{l:"Projeter Pitch",ic:"🎤",a:function(){setProjView("pitch");setShowProjection(true);}},{l:"Projeter Ecriture",ic:"📝",a:function(){setProjView("writing");setShowProjection(true);}},{l:"Message a tous",ic:"📢",a:function(){setNotifs(function(p){ return [{id:Date.now(),text:"Message envoye a toute la classe",time:"now",icon:"📢",cat:"response"}].concat(p.slice(0, 6)); });}},{l:"Voir les reponses",ic:"💬",a:function(){setSideTab("responses");setSideOpen(true);}},{l:"Voir les eleves",ic:"👥",a:function(){setSideTab("students");setSideOpen(true);}}].filter(function(x){return !cmdQ || x.l.toLowerCase().indexOf(cmdQ.toLowerCase()) >= 0;}).map(function(a, i) {
              return React.createElement("button", {key:i,onClick:function(){a.a();setCmdOpen(false);setCmdQ("");},style:Object.assign({}, bs, {width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,background:i === 0 ? T.accentDim : "transparent",color:T.text,fontSize:13,fontWeight:500,textAlign:"left"})},
                React.createElement("span", {style:{fontSize:18,width:28,textAlign:"center"}}, a.ic),
                a.l
              );
            })
          )
        )
      )
    )
  );
}
