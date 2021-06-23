const fs = require('fs');
const { page } = require('pdfkit');
const puppeteer = require('puppeteer');
let questions = {}
let mainPage;
let mainBrowser;

const readline = require("readline");

let rl = readline.createInterface(
    process.stdin,
    process.stdout
)

rl.question("What DSA you want to practice ? \n", async function (ans1) {
    rl.question("Number of Questions you want to practice\n",async function(ans2){
        rl.question("Enter your difficulty level:(Easy,Medium,Hard,All)\n",async function(ans3){
           
            if(ans3.toLowerCase()=="easy")
            { 
                await pattern532GFG(ans1,ans2,0);
                await pattern532LC(ans1,ans2,0);
            }
            else if(ans3.toLowerCase()=="medium")
            {     
                await pattern532GFG(ans1,ans2,1);
                await pattern532LC(ans1,ans2,1);
            }
            else if(ans3.toLowerCase()=="hard")
            {      
                await pattern532GFG(ans1,ans2,2);
                await pattern532LC(ans1,ans2,2);
            }
            else
            {
                await pattern532GFG(ans1,ans2);
                await pattern532LC(ans1,ans2);
            }

            rl.close();
        })

    })
})

async function pattern532GFG(dsaTopic, numQues, difficulty) {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
        slowMo: 100
    });

    let pagesArr = await browser.pages();
    const pageGFG = pagesArr[0];

    mainBrowser=browser;
    mainPage=pageGFG;
    
    await pageGFG.goto('https://practice.geeksforgeeks.org/explore/?page=1');
    await pageGFG.waitForSelector("div[href='#collapse4'] h4");

    await pageGFG.evaluate(function () {
        document.querySelector("div[href='#collapse4'] h4").click();
        document.querySelector("#moreCategories").click();
    })
    await pageGFG.waitForSelector("#searchCategories");
    await pageGFG.type("#searchCategories", dsaTopic)
    await pageGFG.click('[style="font-size: 12px; padding: 10px; display: block;"]', { delay: 2000 })
    await pageGFG.click("#selectCategoryModal", { delay: 500 })
    await pageGFG.click("div[href='#collapse1'] h4", { delay: 2000 });

    if(difficulty==0)
    {
        await Promise.all([
            pageGFG.waitForNavigation(),
            pageGFG.click("[value='0']", { delay: 2000 })
        ])
        await pageGFG.waitForSelector(".panel.problem-block div>span")
        questions["Easy Questions: "] = await getGFGQuestions(pageGFG, numQues);  
    }
    else if(difficulty==1)
    {
        await Promise.all([
            pageGFG.waitForNavigation(),
            pageGFG.click("[value='1']", { delay: 2000 })
        ])
        await pageGFG.waitForSelector(".panel.problem-block div>span")
        questions["Medium Questions: "] =  await getGFGQuestions(pageGFG, numQues)
    }
    else if(difficulty==2)
    {
        await Promise.all([
            pageGFG.waitForNavigation(),
            pageGFG.click("[value='2']", { delay: 2000 })
        ])
        await pageGFG.waitForSelector(".panel.problem-block div>span")
        questions["Hard Questions: "] =  await getGFGQuestions(pageGFG, numQues)

    }
    else
    {
        await Promise.all([
            pageGFG.waitForNavigation(),
            pageGFG.click("[value='0']", { delay: 2000 })
        ])
        await pageGFG.waitForSelector(".panel.problem-block div>span")
        questions["Easy Questions: "] = await getGFGQuestions(pageGFG, numQues); 

        await pageGFG.click("[value='0']", { delay: 2000 })
        await Promise.all([
            pageGFG.waitForNavigation(),
            pageGFG.click("[value='1']", { delay: 2000 })
        ])
        await pageGFG.waitForSelector(".panel.problem-block div>span")
        questions["Medium Questions: "] =  await getGFGQuestions(pageGFG, numQues)

        await pageGFG.click("[value='1']", { delay: 2000 })
        await Promise.all([
            pageGFG.waitForNavigation(),
            pageGFG.click("[value='2']", { delay: 2000 })
        ])
        await pageGFG.waitForSelector(".panel.problem-block div>span")
        questions["Hard Questions: "] =  await getGFGQuestions(pageGFG, numQues)  

    }
    
    let fileName = dsaTopic + "GFGQuestions.json";
    fs.writeFile(fileName, JSON.stringify(questions), function (err) {
        if (err) {
            console.log(err);
        }
    })

}

async function pattern532LC(dsaTopic,numQues, difficulty) {

    const pageLC = mainPage;
    await pageLC.goto('https://leetcode.com/problemset/all/');
    await pageLC.click("#headlessui-popover-button-17", { delay: 1000 })
    await pageLC.click("[placeholder='Filter topics']", { delay: 1000 })
    await pageLC.type("[placeholder='Filter topics']", dsaTopic)
    await pageLC.click(".flex.flex-wrap.py-4.-m-1 span");

    if(difficulty==0)
    questions["Easy Questions: "] = await getLCQuestions(pageLC, difficulty, numQues);
    else if(difficulty==1)
    questions["Medium Questions: "] = await getLCQuestions(pageLC, difficulty, numQues);
    else if(difficulty==2)
    questions["Hard Questions: "] = await getLCQuestions(pageLC, difficulty, numQues);
    else
    {
        questions["Easy Questions: "] = await getLCQuestions(pageLC, 0, numQues);
        questions["Medium Questions: "] = await getLCQuestions(pageLC, 1, numQues);
        questions["Hard Questions: "] = await getLCQuestions(pageLC, 2, numQues);
    }

    let fileName = dsaTopic + "LeetCode Questions.json";
    fs.writeFile(fileName, JSON.stringify(questions), function (err) {
        if (err) {
            console.log(err);
        }
        mainBrowser.close();
    })
}

async function getLCQuestions(pageLC, difficulty, numQues) {

    await pageLC.evaluate(function () {
        document.querySelectorAll(".relative div>button[type='button'][aria-haspopup='true']")[1].click();
    })
    await pageLC.waitForSelector(".flex.items-center.h-5", { visible: true });
    await pageLC.evaluate(function (difficulty) {
        document.querySelectorAll(".flex.items-center.h-5")[difficulty].click();
    }, difficulty)

    let p = new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, 5000)
    })

    await p;
    return await pageLC.evaluate(function (numQues) {
        let ques = {};
        let allTrs = document.querySelectorAll("tbody tr");

        if (allTrs.length >= Number(numQues)) {
            for (let i = 2; i < Number(numQues)+2; i++) {
                let allATags = allTrs[i].querySelectorAll("td a");
                let problemName = allATags[0].innerText;
                let problemLink = "https://leetcode.com" + allATags[0].getAttribute("href");
                ques[problemName] = problemLink;
            }
        }
        else {
            for (let i = 2; i < allTrs.length; i++) {
                let allATags = allTrs.querySelectorAll("td a");
                let problemName = allATags[0].innerText;
                let problemLink = "https://leetcode.com" + allATags[0].getAttribute("href");
                ques[problemName] = problemLink;
            }
        }

        return ques;
    }, numQues)
}
async function getGFGQuestions(pageGFG, numQues) {
    return await pageGFG.evaluate(function (numQues) {
        let ques = {};
        let problemName = document.querySelectorAll(".panel.problem-block div>span");
        let problemLink = document.querySelectorAll('[style="position: absolute;top: 0;left: 0;height: 100%;width: 100%;z-index:1;pointer:cursor;"]');

        if (problemName.length > numQues) {

            for (let i = 0; i < numQues; i++) {

                ques[problemName[i].innerText] = problemLink[i].getAttribute("href");
            }
        }
        else {
            for (let i = 0; i < problemName.length; i++) {

                ques[problemName[i].innerText] = problemLink[i].getAttribute("href");
            }
        }


        return ques;

    }, numQues)
}