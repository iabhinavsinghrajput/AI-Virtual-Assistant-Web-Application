import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import { IoSend } from "react-icons/io5";
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";
import userImg from "../assets/user.gif"
function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse,clearUserHistory}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const [micPermissionError, setMicPermissionError] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [blockedUrl, setBlockedUrl] = useState("")
  const isSpeakingRef=useRef(false)
  const recognitionRef=useRef(null)
  const [ham,setHam]=useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const isRecognizingRef=useRef(false)
  const forceProcessRef = useRef(false)
  const synth=window.speechSynthesis

  const handleLogOut=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = () => {
    
   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    try {
      recognitionRef.current?.start();
      console.log("Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
      }
    }
  }
    
  }

  const speak=(text)=>{
    const utterence=new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN';
    const voices =window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterence.voice = hindiVoice;
    }


    isSpeakingRef.current=true
    utterence.onend=()=>{
        setAiText("");
        setUserText("");
        isSpeakingRef.current = false;
    }
   synth.cancel(); // 🛑 pehle se koi speech ho to band karo
synth.speak(utterence);
  }

  const openLink = (url) => {
    setBlockedUrl("");
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      setBlockedUrl(url);
      speak("Please allow popups so I can open this link for you.");
    }
  };

  const handleCommand=(data)=>{
    if (!data) return;
    const {type,userInput,response}=data
    if (response) {
      speak(response);
    }
    
    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      openLink(`https://www.google.com/search?q=${query}`);
    }
    if (type === 'calculator-open') {
      openLink(`https://www.google.com/search?q=calculator`);
    }
    if (type === "instagram-open") {
      openLink(`https://www.instagram.com/`);
    }
    if (type ==="facebook-open") {
      openLink(`https://www.facebook.com/`);
    }
    if (type ==="weather-show") {
      openLink(`https://www.google.com/search?q=weather`);
    }
    if (type === 'youtube-search' || type === 'youtube-play') {
      const trimmedInput = userInput ? userInput.trim().toLowerCase() : "";
      if (trimmedInput === "youtube" || trimmedInput === "open youtube" || !trimmedInput) {
        openLink(`https://www.youtube.com/`);
      } else {
        const query = encodeURIComponent(userInput);
        openLink(`https://www.youtube.com/results?search_query=${query}`);
      }
    }
  }

  const handleTextInputSubmit = async () => {
    if (!textInput.trim()) return;
    const command = textInput.trim();
    setTextInput("");
    setAiText("");
    setUserText(command);
    
    // Stop recognition temporarily if running
    if (isRecognizingRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error(e);
      }
    }
    
    const data = await getGeminiResponse(command);
    if (data) {
      handleCommand(data);
      setAiText(data.response || "");
    } else {
      setAiText("Sorry, I couldn't get a response.");
      speak("Sorry, I couldn't get a response.");
    }
  };

  const handleMicClick = () => {
    forceProcessRef.current = true;
    if (isRecognizingRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error(e);
      }
    } else {
      startRecognition();
    }
  };

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = 'en-IN';
  recognition.interimResults = false;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  // Auto-start is removed to prevent rate limit issues from background noise

  recognition.onstart = () => {
    isRecognizingRef.current = true;
    setListening(true);
    setMicPermissionError(false);
  };

  recognition.onend = () => {
    isRecognizingRef.current = false;
    setListening(false);
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if (event.error === 'not-allowed') {
      setMicPermissionError(true);
    }
  };

  recognition.onresult = async (e) => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    if (!transcript) return;
    
    setUserText(transcript); // Live transcript update for instant feedback
    
    forceProcessRef.current = false; // Reset force flag
    setAiText("");
    recognition.stop();
    isRecognizingRef.current = false;
    setListening(false);
    
    const data = await getGeminiResponse(transcript);
    if (data) {
      handleCommand(data);
      setAiText(data.response || "");
    } else {
      setAiText("Sorry, I couldn't get a response.");
      speak("Sorry, I couldn't get a response.");
    }
  };


    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
    greeting.lang = 'hi-IN';
   
    window.speechSynthesis.speak(greeting);
 

  return () => {
    isMounted = false;
    recognition.stop();
    setListening(false);
    isRecognizingRef.current = false;
  };
}, []);




  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
 <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)}/>
 <button className='min-w-[150px] h-[60px]  text-black font-semibold   bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px]  text-black font-semibold  bg-white  rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

<div className='w-full h-[2px] bg-gray-400'></div>
      <button className='min-w-[150px] h-[60px]  text-black font-semibold  bg-white  rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] ' onClick={() => { setHam(false); setShowHistory(true); }}>History</button>

      </div>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px]  bg-white rounded-full cursor-pointer text-[19px] hover:bg-gray-200 transition-all shadow-md' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block hover:bg-gray-200 transition-all shadow-md' onClick={()=>navigate("/customize")}>Customize</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[180px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block hover:bg-gray-200 transition-all shadow-md' onClick={()=>setShowHistory(true)}>History</button>
      
      {/* History Modal */}
      {showHistory && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#02023d] border border-white/20 w-full max-w-[600px] max-h-[80vh] rounded-3xl p-6 flex flex-col shadow-2xl relative">
            <RxCross1 className='text-white absolute top-6 right-6 w-6 h-6 cursor-pointer hover:text-red-400 transition-colors' onClick={()=>setShowHistory(false)}/>
            <h2 className="text-white text-2xl font-bold mb-6 flex items-center justify-between">
              Your History
              {userData.history?.length > 0 && (
                <button 
                  onClick={clearUserHistory}
                  className="text-sm bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all mr-8"
                >
                  Clear History
                </button>
              )}
            </h2>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin scrollbar-thumb-white/20">
              {userData.history?.length > 0 ? (
                [...userData.history].reverse().map((his, index) => (
                  <div key={index} className='bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 text-[16px] break-words shadow-sm'>
                    {his}
                  </div>
                ))
              ) : (
                <div className="text-white/50 text-center mt-10">No history found. Say something to start!</div>
              )}
            </div>
          </div>
        </div>
      )}
      {micPermissionError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm max-w-[90%] text-center backdrop-blur-sm shadow-md animate-pulse">
          🎤 Microphone permission denied. Please allow it or type your command below.
        </div>
      )}
      {blockedUrl && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-4 py-2.5 rounded-full text-sm max-w-[90%] text-center backdrop-blur-sm shadow-md flex items-center justify-center gap-2">
          <span>⚠️ Popup blocked!</span>
          <a 
            href={blockedUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => setBlockedUrl("")}
            className="underline font-semibold hover:text-white cursor-pointer"
          >
            Click here to open
          </a>
          <span>or allow popups in your browser settings.</span>
        </div>
      )}
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover'/>
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
    
      <div className='flex flex-col items-center justify-center min-h-[50px] px-4 w-[90%] max-w-[600px] text-center'>
        {userText && <h1 className='text-white text-[18px] font-semibold text-wrap'>"{userText}"</h1>}
        {aiText && <p className='text-[#a7a7ff] text-[15px] font-medium text-wrap mt-1'>{aiText}</p>}
      </div>

      <div className="text-white/50 text-xs font-semibold tracking-wider uppercase mt-3 mb-1 animate-pulse">
        {isSpeakingRef.current ? "🔊 Speaking Response..." : listening ? `🎤 Listening (Speak your command or type below)` : "💤 Idle"}
      </div>

      <div className="w-[90%] max-w-[500px] bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-1.5 flex items-center justify-between shadow-lg focus-within:border-blue-500/50 transition-all">
        <button 
          onClick={handleMicClick}
          className={`mr-3 rounded-full p-2.5 transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${listening ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/30" : "bg-white/10 hover:bg-white/20 text-white"}`}
          title="Click to talk (no wake word needed)"
        >
          {listening ? <BiMicrophoneOff className="w-4 h-4" /> : <BiMicrophone className="w-4 h-4" />}
        </button>
        <input 
          type="text" 
          placeholder={`Type a command or click the mic to speak...`}
          className="bg-transparent text-white placeholder-white/30 outline-none flex-grow mr-3 py-1.5 text-base border-none"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextInputSubmit();
          }}
        />
        <button 
          onClick={handleTextInputSubmit}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
        >
          <IoSend className="w-4 h-4" />
        </button>
      </div>
      
    </div>
  )
}

export default Home