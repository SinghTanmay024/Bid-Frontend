$content = @" > script.ps1 && echo import api from './axios'; >> script.ps1 && echo export const createContest = (data) =^> api.post('/api/contests', data); >> script.ps1 && echo "@  
[System.IO.File]::WriteAllText('C:\Users\Tanmay.s\Desktop\Bid-Frontend\src\api\contests.js', $content) 
