// CONSTANTS
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const moment = require('moment');
const tMoment = require('moment-timezone');
const fs = require('node:fs');
const orgFs = require('fs').promises;
const RobloxModerationService = require('../Services/RobloxModerationService');
const DiscordModerationService = require('../Services/DiscordModerationService');

// HELPERS
async function filterForObject(objects, searchKey, expectedResult) {
    var selected = {};
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        if (object[searchKey] && object[searchKey] == expectedResult) {
            selected = object;
        }
    }
    return selected;
}

async function convertToLocal(epoch) {
    var d = new Date(0);
    d.setUTCSeconds(epoch);

    return tMoment.tz(d.toUTCString(), 'America/Chicago').format('MM/DD/YYYY hh:mm A');
}

// GATEWAY
module.exports.gatewayInfo = {
    Name: 'Statistics',
}

module.exports.newSocket = (socket) => {
    // ALL GENERAL PERMITTED SOCKET ENDPOINTS
    socket.on('getModerationStatistics', async (callback) => {
        const [pastWeeksBansRoblox, pastWeeksWarningsRoblox, thisWeeksTopBanModeratorRoblox, thisWeeksTopWarningModeratorRoblox] = await RobloxModerationService.getWeeklyStatistics();
        const [pastWeeksBansDiscord, pastWeeksModerationsDiscord, thisWeeksTopBanModeratorDiscord, thisWeeksTopModerationModeratorDiscord] = await DiscordModerationService.getWeeklyStatistics();

        callback({
            message: 'Success',
            Discord: {
                pastWeeksBans: pastWeeksBansDiscord,
                pastWeeksModerations: pastWeeksModerationsDiscord,
                thisWeeksTopBanModerator: thisWeeksTopBanModeratorDiscord,
                thisWeeksTopModerationModerator: thisWeeksTopModerationModeratorDiscord
            },
            Roblox: {
                pastWeeksBans: pastWeeksBansRoblox,
                pastWeeksWarnings: pastWeeksWarningsRoblox,
                thisWeeksTopBanModerator: thisWeeksTopBanModeratorRoblox,
                thisWeeksTopWarningModerator: thisWeeksTopWarningModeratorRoblox
            }
        });
    });

    socket.on('generateMonthlyReport', async (month, callback) => {
        if (!month || isNaN(month) || month <= 0 || month > 12) return callback({success: false, message: 'Invalid Arguments'});
        const [pastMonthsBansRoblox, pastMonthsWarningsRoblox] = await RobloxModerationService.getMonthlyStatistics();
        const [pastMonthsBansDiscord, pastMonthsModerationsDiscord] = await DiscordModerationService.getMonthlyStatistics();

        var selectedMonthRobloxBans = (await filterForObject(pastMonthsBansRoblox, 'Month', month)).Bans || 0;
        var selectedMonthRobloxWarnings = (await filterForObject(pastMonthsWarningsRoblox, 'Month', month)).Warnings || 0;
        var selectedMonthDiscordBans = (await filterForObject(pastMonthsBansDiscord, 'Month', month)).Bans || 0;
        var selectedMonthDiscordModerations = (await filterForObject(pastMonthsModerationsDiscord, 'Month', month)).Moderations || 0;

        var monthlyReport = new jsPDF();

        // Header
        var headerImage = new Image();
        headerImage.src = './public/media/images/staff-logo.png';

        monthlyReport.addImage(headerImage, 'png', 10, 78, 12, 15);

        // Style
        monthlyReport.setFont("helvetica")
        monthlyReport.setFontSize(10)

        // Statistics Table
        monthlyReport.autoTable({
            headStyles: {fillColor: [111, 0, 11]},
            styles: {lineWidth: 0.2},
            head: [['Statistic', 'Number']], 
            body: [
                ['Roblox Bans', String(selectedMonthRobloxBans)],
                ['Roblox Warnings', String(selectedMonthRobloxWarnings)],
                ['Discord Bans', String(selectedMonthDiscordBans)],
                ['Discord Moderations', String(selectedMonthDiscordModerations)]
            ]
        });

        // Footer
        monthlyReport.text(`Generated on ${await convertToLocal(Math.round(Date.now() / 1000), true)}`, 138, 285)
        
        // Storing
        var year = moment().year();
        var storeFolderExists = fs.existsSync(`./public/reports/monthly/${year}`);
        if (!storeFolderExists) {
            await fs.mkdirSync(`./public/reports/monthly/${year}`);
        }

        var monthlyReportData = monthlyReport.output();
        var monthName = moment(`${month}`, 'MM').format('MMMM');

        orgFs.writeFile(`./public/reports/monthly/${year}/${monthName}Report.pdf`, monthlyReportData, 'binary')
            .then(() => {
                callback({success: true, message: `https://portal.romestaff.com/reports/monthly/${year}/${monthName}Report.pdf`});
            }).catch((err) => {
                callback({success: false, message: err.message});
            });
    });
}