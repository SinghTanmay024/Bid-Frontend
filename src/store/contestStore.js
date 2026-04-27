import {create} from "zustand";
export const useContestStore=create((set)=>({
  contests:[],activeContest:null,participants:{},winners:{},drawLogs:{},
  setContests:(contests)=>set({contests}),
  setActiveContest:(contest)=>set({activeContest:contest}),
  setParticipants:(cid,list)=>set((s)=>({participants:{...s.participants,[cid]:list}})),
  setWinners:(cid,list)=>set((s)=>({winners:{...s.winners,[cid]:list}})),
  setDrawLog:(cid,log)=>set((s)=>({drawLogs:{...s.drawLogs,[cid]:log}})),
  updateContestInList:(updated)=>set((s)=>({
    contests:s.contests.map((c)=>(c.id===updated.id?updated:c)),
    activeContest:s.activeContest?.id===updated.id?updated:s.activeContest,
  })),
}));
