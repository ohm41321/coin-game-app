// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    debug: true,
    fallbackLng: 'en',
    supportedLngs: ['en', 'th'],
    interpolation: {
      escapeValue: false, // Not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          "appName": "Budgeting Game",
          "connectionError": "Connection Error: {{error}}",
          "roleSelector": {
            "title": "Select Your Role",
            "description": "Are you here to play or to run the game?",
            "player": "Player",
            "gm": "Game Master",
            "playerButton": "Join as Player",
            "gmButton": "Login as Game Master"
          },
          "playerLogin": {
            "title": "Player Login",
            "joinGameTitle": "Join the Game",
            "nameLabel": "Your Name",
            "namePlaceholder": "Enter Your Name",
            "loginButton": "Login / Register",
            "joinGameButton": "Join Game",
            "joiningButton": "Joining...",
            "loginMessage": "Game may have been reset. Please log in again."
          },
          "gmLogin": {
            "title": "Game Master Login",
            "passwordLabel": "Password",
            "passwordPlaceholder": "Enter GM Password",
            "loginButton": "Login",
            "loggingInButton": "Logging in...",
            "defaultPasswordHint": "Default password is: password123"
          },
          "waitingRoom": {
            "title": "Waiting for Game to Start",
            "playerCount": "{{count}} player have joined. ({{count}} players have joined.)",
            "noPlayers": "No players have joined yet.",
            "waitingForPlayers": "Waiting for players to join...",
            "waitingForGM": "Waiting for GM to start the game.",
            "startGame": "Start Game",
            "startingButton": "Starting...",
            "startRoundButton": "Start Round 1",
            "resetGameButton": "Reset Game",
            "playerWaitingMessage": "The Game Master will start the game shortly.",
            "resetConfirm": "Are you sure you want to reset the entire game? All players will be disconnected."
          },
          "leaderboard": {
            "gameOver": "Game Over!",
            "gameOverTitle": "Game Over!",
            "finalLeaderboardTitle": "🏆 Final Leaderboard 🏆",
            "title": "🏆 Final Leaderboard 🏆",
            "coins": "{{count}} coins",
            "thankYou": "Thank you for playing!",
            "thankYouMessage": "Thank you for playing!",
            "resetGame": "Reset Game for All Players",
            "resetConfirm": "Are you sure you want to reset the entire game? This will allow a new game to begin."
          },
          "gmDashboard": {
            "title": "GM Dashboard - Round {{currentRound}}",
            "endGameEarlyButton": "End Game Early",
            "resetGameButton": "Reset Game",
            "endGameEarlyConfirm": "Are you sure you want to end the game now and calculate final scores?",
            "playerStatusTitle": "Player Status",
            "playerListItem": "{{name}}: {{totalCoins}} coins | Income: {{income}} |",
            "submittedStatus": "✅ Submitted",
            "waitingStatus": "...Waiting",
            "choosingStatus": "...Choosing",
            "doneStatus": "✅ Done",
            "shortTerm": "Short-term:",
            "longTerm": "Long-term:",
            "emergency": "Emergency:",
            "phaseAllocationMessage": "{{submittedCount}} / {{playerListLength}} players have submitted allocations.",
            "drawEventCardButton": "Draw Event Card",
            "phaseEventResolutionMessage": "{{resolvedCount}} / {{playerListLength}} players have resolved the event.",
            "waitingForPlayerChoices": "Waiting for players to make their choices...",
            "phaseEventDrawnMessage": "All events are resolved. You can now end the round.",
            "calculateAndEndRoundButton": "Calculate & End Round {{currentRound}}",
            "roundResultsTitle": "Round {{currentRound}} Results",
            "startNextRoundButton": "Start Round {{nextRound}}",
            "currentPhase": "Current Phase: {{phase}}",
            "actionFailed": "Action failed"
          },
          "playerView": {
            "continueButton": "Continue",
            "waitingForOtherPlayers": "Waiting for other players to submit their allocation...",
            "allocateCoinsMessage": "Allocate your {{allocationBudget}} coins for this round.",
            "foodHousingLabel": "🏠 Food / Housing",
            "foodHousingDescription": "Cost is 5. Underpayment creates debt. Overpayment will be credited.",
            "shortTermInvestmentLabel": "📈 Short-term Investment",
            "shortTermInvestmentDescription": "3 coins = +1 income",
            "longTermInvestmentLabel": "🌳 Long-term Investment",
            "longTermInvestmentDescription": "4 coins = +1 income, plus bonus",
            "emergencyFundLabel": "🛡️ Emergency Fund",
            "emergencyFundDescription": "Covers deficits and events",
            "totalAllocated": "Total Allocated: {{totalAllocated}} / {{allocationBudget}}",
            "submitButton": "Submit",
            "allocationSumError": "Your allocation must sum to {{allocationBudget}}.",
            "submitFailed": "Failed to submit.",
            "waitingToResolveEvent": "Waiting for players to resolve the event...",
            "eventResolvedWaitingGM": "Event resolved. Waiting for GM.",
            "roundEndedWaitingNextRound": "Round {{currentRound}} ended. Waiting for next round.",
            "pleaseWait": "Please wait...",
            "totalCoins": "Total Coins: {{totalCoins}}",
            "foodDebt": "Food Debt: {{foodDebt}}",
            "foodPrepayment": "Food Pre-payment: {{foodPrepayment}}",
            "incomeNextRound": "Income for next round: {{income}}",
            "roundTitle": "Round {{currentRound}}",
            "failedAcknowledgeSummary": "Failed to acknowledge summary",
            "playerStatusName": "{{name}}",
            "playerStatusTotalCoins": "Total Coins: {{totalCoins}}",
            "playerStatusFoodDebt": "Food Debt: {{foodDebt}}",
            "playerStatusFoodPrePayment": "Food Pre-payment: {{foodPrepayment}}",
            "playerStatusIncomeNextRound": "Income for next round: {{income}}"
          },
          "roundSummaryModal": {
            "title": "End of Round Summary",
            "continueButton": "Start Next Round",
            "loadingButton": "Please wait..."
          }
        }
      },
      th: {
        translation: {
          "appName": "เกมบริหารเงิน",
          "connectionError": "ข้อผิดพลาดในการเชื่อมต่อ: {{error}}",
          "roleSelector": {
            "title": "เลือกบทบาทของคุณ",
            "description": "คุณมาเล่นเกมหรือบริหารเกม?",
            "player": "ผู้เล่น",
            "gm": "ผู้คุมเกม",
            "playerButton": "เข้าร่วมในฐานะผู้เล่น",
            "gmButton": "เข้าสู่ระบบในฐานะผู้คุมเกม"
          },
          "playerLogin": {
            "title": "เข้าสู่ระบบสำหรับผู้เล่น",
            "joinGameTitle": "เข้าร่วมเกม",
            "nameLabel": "ชื่อของคุณ",
            "namePlaceholder": "กรอกชื่อของคุณ",
            "loginButton": "เข้าสู่ระบบ / ลงทะเบียน",
            "joinGameButton": "เข้าร่วมเกม",
            "joiningButton": "กำลังเข้าร่วม...",
            "loginMessage": "เกมอาจถูกรีเซ็ต โปรดเข้าสู่ระบบอีกครั้ง"
          },
          "gmLogin": {
            "title": "เข้าสู่ระบบสำหรับผู้คุมเกม",
            "passwordLabel": "รหัสผ่าน",
            "passwordPlaceholder": "ป้อนรหัสผ่านผู้คุมเกม",
            "loginButton": "เข้าสู่ระบบ",
            "loggingInButton": "กำลังเข้าสู่ระบบ...",
            "defaultPasswordHint": "รหัสผ่านเริ่มต้นคือ: password123"
          },
          "waitingRoom": {
            "title": "กำลังรอเกมเริ่ม",
            "playerCount": "มีผู้เล่น {{count}} คนเข้าร่วมแล้ว (มีผู้เล่น {{count}} คนเข้าร่วมแล้ว)",
            "noPlayers": "ยังไม่มีผู้เล่นเข้าร่วม",
            "waitingForPlayers": "กำลังรอผู้เล่นเข้าร่วม...",
            "waitingForGM": "กำลังรอผู้คุมเกมเริ่มเกม",
            "startGame": "เริ่มเกม",
            "startingButton": "กำลังเริ่ม...",
            "startRoundButton": "เริ่มรอบที่ 1",
            "resetGameButton": "รีเซ็ตเกม",
            "playerWaitingMessage": "ผู้คุมเกมจะเริ่มเกมในไม่ช้า",
            "resetConfirm": "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตเกมทั้งหมด? ผู้เล่นทุกคนจะถูกตัดการเชื่อมต่อ"
          },
          "leaderboard": {
            "gameOver": "จบเกม!",
            "gameOverTitle": "จบเกม!",
            "finalLeaderboardTitle": "🏆 ตารางสรุปอันดับ 🏆",
            "title": "🏆 ตารางสรุปอันดับ 🏆",
            "coins": "{{count}} เหรียญ",
            "thankYou": "ขอบคุณที่เล่น!",
            "thankYouMessage": "ขอบคุณที่เล่น!",
            "resetGame": "รีเซ็ตเกมสำหรับผู้เล่นทั้งหมด",
            "resetConfirm": "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตเกมทั้งหมด? สิ่งนี้จะอนุญาตให้เริ่มเกมใหม่"
          },
          "gmDashboard": {
            "title": "แดชบอร์ดผู้คุมเกม - รอบที่ {{currentRound}}",
            "endGameEarlyButton": "จบเกมก่อนกำหนด",
            "resetGameButton": "รีเซ็ตเกม",
            "endGameEarlyConfirm": "คุณแน่ใจหรือไม่ว่าต้องการจบเกมตอนนี้และคำนวณคะแนนสุดท้าย?",
            "playerStatusTitle": "สถานะผู้เล่น",
            "playerListItem": "{{name}}: {{totalCoins}} เหรียญ | รายได้: {{income}} |",
            "submittedStatus": "✅ ส่งแล้ว",
            "waitingStatus": "...กำลังรอ",
            "choosingStatus": "...กำลังเลือก",
            "doneStatus": "✅ เสร็จสิ้น",
            "shortTerm": "ระยะสั้น:",
            "longTerm": "ระยะยาว:",
            "emergency": "ฉุกเฉิน:",
            "phaseAllocationMessage": "ผู้เล่น {{submittedCount}} / {{playerListLength}} คนส่งการจัดสรรแล้ว",
            "drawEventCardButton": "จับการ์ดเหตุการณ์",
            "phaseEventResolutionMessage": "ผู้เล่น {{resolvedCount}} / {{playerListLength}} คนแก้ไขเหตุการณ์แล้ว",
            "waitingForPlayerChoices": "กำลังรอผู้เล่นเลือก...",
            "phaseEventDrawnMessage": "เหตุการณ์ทั้งหมดได้รับการแก้ไขแล้ว คุณสามารถจบรอบได้เลย",
            "calculateAndEndRoundButton": "คำนวณและจบรอบที่ {{currentRound}}",
            "roundResultsTitle": "ผลรอบที่ {{currentRound}}",
            "startNextRoundButton": "เริ่มรอบที่ {{nextRound}}",
            "currentPhase": "เฟสปัจจุบัน: {{phase}}",
            "actionFailed": "ดำเนินการล้มเหลว"
          },
          "playerView": {
            "continueButton": "ดำเนินการต่อ",
            "waitingForOtherPlayers": "กำลังรอผู้เล่นอื่นส่งการจัดสรร...",
            "allocateCoinsMessage": "จัดสรรเหรียญของคุณ {{allocationBudget}} เหรียญสำหรับรอบนี้",
            "foodHousingLabel": "🏠 ค่าอาหาร/ที่อยู่",
            "foodHousingDescription": "ค่าใช้จ่าย 5 เหรียญ การชำระน้อยกว่าจะทำให้เป็นหนี้ การชำระเกินจะถูกเครดิต",
            "shortTermInvestmentLabel": "📈 การลงทุนระยะสั้น",
            "shortTermInvestmentDescription": "3 เหรียญ = +1 รายได้",
            "longTermInvestmentLabel": "🌳 การลงทุนระยะยาว",
            "longTermInvestmentDescription": "4 เหรียญ = +1 รายได้, พร้อมโบนัส",
            "emergencyFundLabel": "🛡️ กองทุนฉุกเฉิน",
            "emergencyFundDescription": "ครอบคลุมการขาดดุลและเหตุการณ์ต่างๆ",
            "totalAllocated": "จัดสรรทั้งหมด: {{totalAllocated}} / {{allocationBudget}}",
            "submitButton": "ส่ง",
            "allocationSumError": "การจัดสรรของคุณต้องรวมกันเป็น {{allocationBudget}}",
            "submitFailed": "ส่งไม่สำเร็จ",
            "waitingToResolveEvent": "กำลังรอผู้เล่นแก้ไขเหตุการณ์...",
            "eventResolvedWaitingGM": "แก้ไขเหตุการณ์แล้ว กำลังรอผู้คุมเกม",
            "roundEndedWaitingNextRound": "จบรอบที่ {{currentRound}} แล้ว กำลังรอรอบถัดไป",
            "pleaseWait": "โปรดรอ...",
            "totalCoins": "เหรียญรวม: {{totalCoins}}",
            "foodDebt": "หนี้ค่าอาหาร: {{foodDebt}}",
            "foodPrepayment": "ชำระค่าอาหารล่วงหน้า: {{-foodPrepayment}}",
            "incomeNextRound": "รายได้สำหรับรอบถัดไป: {{income}}",
            "roundTitle": "รอบที่ {{currentRound}}",
            "failedAcknowledgeSummary": "ยืนยันสรุปไม่สำเร็จ",
            "playerStatusName": "{{name}}",
            "playerStatusTotalCoins": "เหรียญรวม: {{totalCoins}}",
            "playerStatusFoodDebt": "หนี้ค่าอาหาร: {{foodDebt}}",
            "playerStatusFoodPrePayment": "ชำระค่าอาหารล่วงหน้า: {{-foodPrepayment}}",
            "playerStatusIncomeNextRound": "รายได้สำหรับรอบถัดไป: {{income}}"
          },
          "roundSummaryModal": {
            "title": "สรุปผลสิ้นสุดรอบ",
            "continueButton": "เริ่มรอบถัดไป",
            "loadingButton": "โปรดรอ..."
          }
        }
      }
    }
  });

export default i18n;
