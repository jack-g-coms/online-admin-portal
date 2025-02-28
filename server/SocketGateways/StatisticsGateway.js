// FONTS
require('../../assets/fonts/Montserrat-Bold-bold.js');
require('../../assets/fonts/Montserrat-Regular-normal.js');

// OTHER
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const moment = require('moment');
const tMoment = require('moment-timezone');
const fs = require('node:fs');
const orgFs = require('fs').promises;
const config = require('../config.json');
const path = require('path');

const RobloxService = require('../Services/RobloxService');
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

    socket.on('getModeratorReport', async (from, to, moderatorRbx, moderatorDiscord, callback) => {
        if (!from || !to || !moderatorRbx || !moderatorDiscord) return callback({message: 'Invalid Arguments'});

        try {
            const [bans, warnings] = await RobloxModerationService.getModeratorReport(from, to, moderatorRbx);
            const [discordBans, discordModerations] = await DiscordModerationService.getModeratorReport(from, to, moderatorDiscord);
            const discordUser = await DiscordModerationService.getDiscordUserInfo(moderatorDiscord);
            const rbxUser = await RobloxService.getUserByID(moderatorRbx);

            callback({
                message: 'Success',
                data: {
                    Roblox: {
                        user: rbxUser,
                        bans: bans.count,
                        warnings: warnings.count
                    },
                    Discord: {
                        user: discordUser,
                        bans: discordBans.count,
                        moderations: discordModerations.count
                    }
                }
            });
        } catch (err) {
            callback({message: 'Not Found'});
        }
    });

    socket.on('getModerationReport', async (from, to, callback) => {
        if (!from || !to) return callback({message: 'Invalid Arguments'});

        RobloxModerationService.getModerationReport(from, to)
            .then((result) => {
                callback({message: 'Success', data: result});
            })
            .catch((err) => {
                callback({message: `Error`});
            })
    });

    socket.on('generateMonthlyReport', async (year, month, callback) => {
        if (!month || isNaN(month) || month <= 0 || month > 12) return callback({success: false, message: 'Invalid Arguments'});
        if (year && (isNaN(year) || year > moment().year() || year < 2022)) return callback({success: false, message: 'Report not Available for This Year'});

        const [pastMonthsBansRoblox, pastMonthsWarningsRoblox, commonRobloxBanReasons, commonRobloxWarningsReasons] = await RobloxModerationService.getMonthlyStatistics(year, month);
        const [pastMonthsBansDiscord, pastMonthsModerationsDiscord, commonDiscordBanReasons, commonDiscordModerationsReasons] = await DiscordModerationService.getMonthlyStatistics(year, month);

        var selectedMonthRobloxBans = (await filterForObject(pastMonthsBansRoblox, 'Month', month)).Bans || 'None';
        var selectedMonthRobloxWarnings = (await filterForObject(pastMonthsWarningsRoblox, 'Month', month)).Warnings || 'None';
        var selectedMonthDiscordBans = (await filterForObject(pastMonthsBansDiscord, 'Month', month)).Bans || 'None';
        var selectedMonthDiscordModerations = (await filterForObject(pastMonthsModerationsDiscord, 'Month', month)).Moderations || 'None';

        var reportDate = await convertToLocal(Math.round(Date.now() / 1000), true);
        var monthName = moment(`${month}`, 'MM').format('MMMM');
        var currentYear = moment().year();

        var monthlyReport = new jsPDF();

        // Header
        var headerImageData = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'media', 'images', 'community-shield.png')).toString('base64');
        monthlyReport.addImage(headerImageData, 'PNG', 27.21, 22.606, 26.924, 26.924)

        monthlyReport.setFont('Montserrat-Bold', 'bold')
        monthlyReport.setFontSize(17.1)
        monthlyReport.text(config.communityName.toUpperCase(), 60.96, 5 + 25.146)

        monthlyReport.setFont('Montserrat-Regular', 'normal')
        monthlyReport.setFontSize(16.7)
        monthlyReport.text('STAFF & MODERATION TEAM', 60.96, 5 + 33.782)

        monthlyReport.setTextColor(11, 92, 167)
        monthlyReport.setFontSize(11.7)
        monthlyReport.text('DIVISION OF COMMUNITY RELATIONS', 60.96, 4 + 42.418)

        monthlyReport.setTextColor(0, 0, 0)
        monthlyReport.setFont('Montserrat-Bold', 'bold')
        monthlyReport.setFontSize(10.3)
        monthlyReport.text(`PUBLIC RELEASE`, 29.21, 2 + 66.17)

        monthlyReport.setFont('Montserrat-Regular', 'normal')
        monthlyReport.setFontSize(11.3)
        monthlyReport.text(`Re: Transparency Report of ${monthName} ${year || currentYear}`, 29.21, 3 + 70.57)
        monthlyReport.text(reportDate, monthlyReport.internal.pageSize.width - monthlyReport.getTextWidth(reportDate) - 29.21, 2 + 66.17)

        // Statistics Table
        var tableWidth = 152.29;
        var margin = (monthlyReport.internal.pageSize.width - tableWidth) / 2;

        monthlyReport.setFont('Montserrat-Bold', 'bold')
        monthlyReport.setFontSize(10)
        monthlyReport.text(`Moderation Statistics for ${monthName} ${year || currentYear}`, 29.21, 85)

        monthlyReport.setFont('Montserrat-Regular', 'normal')

        var modTableYPos = 0;
        monthlyReport.autoTable({
            headStyles: {fillColor: [11, 92, 167]},
            styles: {lineWidth: 0.2, font: 'Montserrat-Regular', fontSize: 10},
            margin: {left: margin, right: margin},
            head: [['Type', 'Count']], 
            body: [
                ['Roblox Bans', String(selectedMonthRobloxBans)],
                ['Roblox Warnings', String(selectedMonthRobloxWarnings)],
                ['Discord Bans', String(selectedMonthDiscordBans)],
                ['Discord Moderations', String(selectedMonthDiscordModerations)]
            ],
            didDrawPage: function(data) {
                modTableYPos = data.cursor.y;
            },
            startY: 88
        });

        // Common Reasons Table
        monthlyReport.setFont('Montserrat-Bold', 'bold')
        monthlyReport.setFontSize(10)
        monthlyReport.text(`Most Common Moderation Infractions for ${monthName} ${year || currentYear}`, 29.21, modTableYPos + 13)

        monthlyReport.setFont('Montserrat-Regular', 'normal')
        monthlyReport.autoTable({
            headStyles: {fillColor: [11, 92, 167]},
            styles: {lineWidth: 0.2, font: 'Montserrat-Regular', fontSize: 10},
            margin: {left: margin, right: margin},
            head: [['Type', 'Common Infractions']], 
            body: [
                ['Roblox Bans', commonRobloxBanReasons.join(', ')],
                ['Roblox Warnings', commonRobloxWarningsReasons.join(', ')],
                ['Discord Bans', commonDiscordBanReasons.join(', ')],
                ['Discord Moderations', commonDiscordModerationsReasons.join(', ')]
            ],
            startY: modTableYPos + 16
        });

        // Footer
        var footer = `Generated by ${socket.User.rbxUser.username}`
        monthlyReport.text(footer, monthlyReport.internal.pageSize.width - monthlyReport.getTextWidth(footer) - 20, 285)
        
        // Storing
        var storeFolderExists = fs.existsSync(path.join(__dirname, '..', '..', 'public', 'reports', 'monthly', `${year || currentYear}`));
        if (!storeFolderExists) {
            await fs.mkdirSync(path.join(__dirname, '..', '..', 'public', 'reports', 'monthly', `${year || currentYear}`));
        }

        var monthlyReportData = monthlyReport.output();
        orgFs.writeFile(path.join(__dirname, '..', '..', 'public', 'reports', 'monthly', `${year || currentYear}`, `${monthName}Report.pdf`), monthlyReportData, 'binary')
            .then(() => {
                callback({success: true, message: `https://${config.communityName}portal.communityshield.app/reports/monthly/${year || currentYear}/${monthName}Report.pdf`});
            }).catch((err) => {
                callback({success: false, message: err.message});
            });
    });
}