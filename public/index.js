const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#6A0572'];
const LOCAL_STORAGE_KEY = 'tasks'; 

const elWheel = document.getElementById('wheelCanvas');
const ctx = elWheel.getContext('2d');
const elSpin = document.getElementById('spinButton');
const entries = document.getElementById('input-entries');
const taskModal=document.querySelector('#taskModal');
let myDoughnutChart = null;
let myLineChart = null;

let tasks = []; 

const PI = Math.PI;
const TAU = 2 * PI;
let dia;
let rad;
let tot = 0; 
let arc = 0; 
const angOffset = TAU * 0.75; 

let sectorIndex = 0; 
let oldAng = 0;
let ang = 0; 

let spinAnimation = null;
let animationFrameId;


const rand = (m, M) => Math.random() * (M - m) + m;

const mod = (n, m) => (n % m + m) % m;


const initWheelRotation = () => {
    
    ang = 0;
    elWheel.animate([{ rotate: `${ang + angOffset}rad` }], {
        duration: 0, 
        fill: "forwards"
    });
};

function parseTasks() {
   tasks = entries.value.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    localStorage.setItem(LOCAL_STORAGE_KEY, entries.value);
    dia = elWheel.clientWidth;
    ctx.canvas.width = dia;
    ctx.canvas.height = dia;
    rad = dia / 2; 
    tot = tasks.length;
    arc = tot > 0 ? TAU / tot : 0; 

    if (tot === 0) {
        ctx.clearRect(0, 0, dia, dia); 
        elSpin.textContent = "SPIN";
        return tasks;
    }

    drawWheel(); 
    initWheelRotation();
    return tasks;
}


const getIndex = (ang) => {
    if (tot === 0) return 0;
    return Math.floor(tot - mod(ang, TAU) / TAU * tot) % tot;
};


function drawWheel() {
    ctx.clearRect(0, 0, dia, dia); 
    tasks.forEach(drawSector);
}


const drawSector = (_, i) => {
   
    const ang = arc * i;
    const segmentColor = colors[i % colors.length];
    ctx.save();
    ctx.shadowBlur = 0; 
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.fillStyle = segmentColor;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();
    ctx.font = 'bold 25px Inter ,roboto';
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#01030fff"; 

    if (i === sectorIndex && spinAnimation) {
        ctx.shadowColor = '#bdbaa7ff'; 
        ctx.shadowBlur = 12;         
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = "#ffffffff";
    } 

    const fontSize = Math.min(26 * arc, 20); 
    ctx.font = `bold ${fontSize}px sans-serif`; 
    const taskText = tasks[i];
    const maxLen = 15;
    const display = taskText.length > maxLen ? taskText.substring(0, maxLen - 2) + '...' : taskText;
    ctx.fillText(display, rad - 10, 10);
    ctx.restore();
};

const update = () => {
    if (!spinAnimation) return; 
    const currentProgress = spinAnimation?.effect.getComputedTiming().progress ?? 0;

    const angDiff = ang - oldAng;
    const angCurr = angDiff * currentProgress;
    const angAbs = mod(oldAng + angCurr, TAU);

    const sectorIndexNew = getIndex(angAbs);
    
    if (sectorIndex !== sectorIndexNew) {
        
    }
    sectorIndex = sectorIndexNew;
    
    drawWheel();
    if (tasks.length > 0) {
        elSpin.textContent = tasks[sectorIndex];

    }
};

const spin = (index, duration,seletectTask) => {
    if (tot === 0) return; 
    index = tot - 1 - index; 
    oldAng = ang;
    const angAbs = mod(ang, TAU);
    let angNew = arc * index;
    angNew += rand(0, arc * 0.9); 
   
    angNew = mod(angNew, TAU);
    const angDiff = mod(angNew - angAbs, TAU);
    const rev = TAU * Math.floor(rand(4, 7)); 
    ang += angDiff + rev;

    spinAnimation = elWheel.animate([{ rotate: `${ang + angOffset}rad` }], {
        duration: duration ?? rand(5000, 7000), 
        easing: "cubic-bezier(0.2, 0, 0.1, 1)",
        fill: "forwards"
    });

    spinAnimation.addEventListener("finish", () => {
        if (seletectTask) { 
             removeFromLocalStorage(seletectTask);
             document.querySelector('.taskChosen').innerText= `" ${seletectTask} "`;

             taskModal.showModal();
             parseTasks(); 
             createTask(seletectTask); 
             elSpin.textContent = `${seletectTask}`; 
        } else {
             elSpin.textContent = "Spin"; 
        }
        spinAnimation = null;
        drawWheel();
         elSpin.textContent = "Spin";
        
    }, { once: true });
};

const engine = () => {
    update();
    animationFrameId = requestAnimationFrame(engine)
};

elSpin.addEventListener("click", () => {
    if (spinAnimation) return;
    
    if (tasks.length === 0) {
        alert("Please add tasks to the list first!");
        return;
    }
    
    engine(); 
    const randIndex = Math.floor(Math.random() * tasks.length);
    const seletectTask=tasks[randIndex];
    console.log(seletectTask)
    
    spin(randIndex,null,seletectTask);
   
    
});

function removeFromLocalStorage(item){
    let newTasks=tasks.filter(task=>task!==item);
    const newTasksString = newTasks.join('\n');
    entries.value = newTasksString;
    localStorage.setItem(LOCAL_STORAGE_KEY, newTasksString);
}




window.onload = function() {
 
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDraft) {
        entries.value = savedDraft;
    }
    entries.addEventListener('input', parseTasks);
    engine()
}

function switchTab(evt,tab){
    const tabcontent=document.querySelectorAll(`.tab-content`);
    const tablink=document.querySelectorAll('.tablinks');
    
    tabcontent.forEach(i=>{i.style.display='none'})
    tablink.forEach(i=>{
        i.className=i.className.replace(' active','')
    })
    
    document.getElementById(tab).style.display='block';

    evt.currentTarget.className+=' active';
    if (tab === 'pending') {
        currentFilter = 'pending';
        fetchTasks('pending'); 
    } else if (tab === 'entries') {
        currentFilter = 'entries';
    }
}



let token = localStorage.getItem('token')

let isLoading = false
let isAuthenticating = false
let isRegistration = false
let selectedTab = 'All'
let taskItems = []

const apiBase = '/'

const authContent = document.getElementById('auth')
    //const textError = document.getElementById('error')
const email = document.getElementById('emailInput')
const password = document.getElementById('passwordInput')
const username=document.querySelector('#usernameInput')
const registerBtn = document.getElementById('registerBtn')
const authBtn = document.getElementById('authBtn')
const cmpltSection=document.querySelector('.completed');
const spinnerSection=document.querySelector('.spinner');
const tabsArea=document.querySelector('.tabs-area');
const currentUser=document.querySelector('.user-name');
const pendingContainer=document.querySelector('#pending');
const completedContainer = document.querySelector('.list-completed ul');
const cmpltBtn=document.querySelector('.complete')
const analyticsBtn=document.querySelector('#analyticsBtn');
const  historyBtn=document.querySelector('#historyBtn');
const analyticsSection=document.querySelector('#analytics-section')
const historySection=document.querySelector('#history-section')
let currentFilter = 'Pending';
let isAnalytics=false;
let isHistory=false;
const signOut=document.getElementById('signin');
const LogoutModal=document.getElementById('LogoutModal');


analyticsBtn.addEventListener('click',async ()=>{
        if (!localStorage.getItem('token')) {
        showLogin();
        return;
    }
        cmpltSection.style.display='none';
         spinnerSection.style.display='none';
         tabsArea.style.display='none';  
         authContent.style.display = 'none';
         analyticsSection.style.display='grid';
         historySection.style.display='none';
         isAnalytics=true;
         isHistory=false;
         await fetchTasks('all');
         
})

historyBtn.addEventListener('click',async ()=>{
        if (!localStorage.getItem('token')) {
        showLogin();
        return;
    }
        cmpltSection.style.display='none';
         spinnerSection.style.display='none';
         tabsArea.style.display='none';  
         authContent.style.display = 'none';
         analyticsSection.style.display='none';
         historySection.style.display='flex';
         isAnalytics=false;
         isHistory=true;
         await fetchTasks('all');
         

})

    





async function showDashboard() {
         isAnalytics=false;
         isHistory=false;
         cmpltSection.style.display='block';
         spinnerSection.style.display='block';
         tabsArea.style.display='block';
        signOut.innerText='LogOut';
         authContent.style.display = 'none'

        await fetchTasks('completed');

        setTimeout(parseTasks,0)
}    


LogoutModal.addEventListener('close', () => {
    if (LogoutModal.returnValue === 'logout') {
        logout();
    }
    LogoutModal.returnValue = ''; 
});


function handleLogout() {
    if(token)
    LogoutModal.showModal();
}

function logout() {
    
        localStorage.removeItem('token');
        token = null; 
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        taskItems = [];
       if (myDoughnutChart) myDoughnutChart.destroy();
        if (myLineChart) myLineChart.destroy();

        showLogin();
}

async function showLogin(){
        isAnalytics=false;
        isHistory=false;
        cmpltSection.style.display='none';
         spinnerSection.style.display='none';
         tabsArea.style.display='none';
         registerBtn.innerText='Sign Up';
         authContent.style.display = 'flex'


}

async function fetchTasks(filter) {
    const currentToken = localStorage.getItem('token'); 
    if (!currentToken) {
        logout(); 
        return;
    }
         isLoading = true
         let statusParam = '';
    if (filter === 'pending') {
        statusParam = '?status=pending';
    } else if (filter === 'completed') {
        statusParam = '?status=completed';
    }

    try {
        const response = await fetch(apiBase + 'tasks' + statusParam, {
            headers: { 'Authorization': currentToken }
        });
        if (response.status === 401) {
            console.log("Token expired or unauthorized. Redirecting to login.");
            logout(); 
            return; 
        }
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filter} tasks. Status: ${response.status}`);
        }

        const tasks = await response.json();
        isLoading=false;

        isAnalytics?renderAnalytics(tasks):isHistory?renderHistory(tasks):renderTasks(tasks, filter); 

    } catch (error) {
        console.error(`Error fetching ${filter} tasks:`, error);

    }
}

function renderAnalytics(tasks){
        //doughnut chart

        const tot_completed_len = tasks.filter(task => task.status === true).length;
        const tot_pending_len = tasks.filter(task => task.status === false).length;
        // const total = tasks.length;

        // const completionRate = total > 0 ? Math.round((tot_completed_len / total) * 100) : 0;
         const data = {
            labels: [
                'Pending',
                'Completed',
            ],
            datasets: [{
                label: 'How likely am i to complete my tasks',
                data: [tot_pending_len,tot_completed_len],
                backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                
                ],
                borderWidth:1,
                hoverOffset: 4
            }]
        };
        const ctx_do=document.querySelector('#dough-chart');
        if (myDoughnutChart) myDoughnutChart.destroy(); 
myDoughnutChart =new Chart(ctx_do, {
                type: 'doughnut',
                data: data,
                
        });
        
       

        

        //line-graph
        
        const daily_data=dailyDatafn(tasks);
        calcLineGraph(daily_data);
        

}

function dailyDatafn(tasks){
        let daily_data={};
        tasks.map(task=>{
            const day = new Date(task.date).toISOString().split('T')[0];

        //     if (!daily_data[day]) {
        //     daily_data[day] = { pending: 0, completed: 0 };
        // }
            if (!daily_data[day]) {
            daily_data[day] = {
                completed: { count: 0, contents: [] },
                pending: { count: 0, contents: [] }
            };
        }
        
       if (task.status === true) {
            daily_data[day].completed.count++;
            daily_data[day].completed.contents.push(task.content);
        } else {
            daily_data[day].pending.count++;
            daily_data[day].pending.contents.push(task.content);
        }
        })
        return daily_data;
}

function calcLineGraph(stats){
        // const dummydata={
        //                 "2025-11-27": {
        //                     "completed": {
        //                         "count": 2,
        //                         "contents": ["Set up project repo", "Design wheel prototype"]
        //                     },
        //                     "pending": {
        //                         "count": 1,
        //                         "contents": ["Write README documentation"]
        //                     }
        //                 },
        //                 "2025-12-30": {
        //                     "completed": {
        //                         "count": 1,
        //                         "contents": ["Refactor chart logic"]
        //                     },
        //                     "pending": {
        //                         "count": 0,
        //                         "contents": []
        //                     }
        //                 },
        //                 "2026-01-05": {
        //                     "completed": {
        //                         "count": 3,
        //                         "contents": ["Add History tab", "Fix CSS layout", "Update spin animation"]
        //                     },
        //                     "pending": {
        //                         "count": 2,
        //                         "contents": ["Debug local storage leak", "Research Vercel deployment"]
        //                     }
        //                 },
        //                 "2026-01-11": { // Today's date
        //                     "completed": {
        //                         "count": 0,
        //                         "contents": []
        //                     },
        //                     "pending": {
        //                         "count": 1,
        //                         "contents": ["Finish History tab rendering"]
        //                     }
        //                 }
        //             };
        const labels = Object.keys(stats).sort();
    //     labels.map(key => {
    //     return new Date(key).toLocaleDateString('en-US', { 
    //         month: 'short', 
    //         day: 'numeric' 
    //     });
    // });
        

        const rates = labels.map(day => {
            const { completed, pending } = stats[day];
            const total = completed.count + pending.count;
        
            return total > 0 ? Math.round((completed.count / total) * 100) : 0;
        });

         const data = {
            labels: labels,
            datasets: [{
                label: 'How likely am i to complete my tasks',
                data: rates,
                backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                
                ],
                borderColor: 'rgb(75, 192, 192)',
                borderWidth:1,
                 tension: 0.1,
                hoverOffset: 4
            }]
        };
        const ctx_li=document.querySelector('#line-graph');
        if (myLineChart) myLineChart.destroy(); // Clear old one
    myLineChart =new Chart(ctx_li, {
                type: 'line',
                data: data,
                
        });
        

    }

function renderHistory(tasks){
    const dailyData=dailyDatafn(tasks);
    const history=document.querySelector('.history-data');
    history.innerHTML='';
    Object.keys(dailyData).forEach(date=>{
        //let  indiContainer;

        const dayData = dailyData[date];
        
        const dayWrapper = document.createElement('div');
        dayWrapper.className = 'history-day-card';

        const completedListHTML = dayData.completed.contents.length > 0 
            ? dayData.completed.contents.map(task => `<li>${task}</li>`).join('')
            : '<div style="opacity:0.6">No tasks completed :(</div>';

        const pendingListHTML = dayData.pending.contents.length > 0 
            ? dayData.pending.contents.map(task => `<li style="opacity:0.6">${task}</li>`).join('')
            : '<div style="opacity:0.6">No tasks missed :D</div>';
         
        converted_date=new Date(date).toLocaleDateString('en-US', { 
             weekday:'long',
             month: 'long', 
             day: 'numeric' 
         });

        dayWrapper.innerHTML = `
            <div class="date" style="font-weight: bold; color: #1a5eb6ff; font-size:17px; margin-top: 15px; margin-bottom:10px;">
                ${converted_date}
            </div>
            <div class="completed-data">
                <strong>Completed:</strong>
                <ul>${completedListHTML}</ul>
            </div>
            <div class="pending-data">
                <strong>Pending:</strong>
                <ul>${pendingListHTML}</ul>
            </div>
        `;

        history.appendChild(dayWrapper);
    })
}

async function updateTaskStatus(taskId){
    try {
        const response = await fetch(apiBase + 'tasks/' +taskId , {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ status: 1 })
        });
        if (!response.ok) {
            throw new Error(`Failed to update task. Status: ${response.status}`);
        }
        
       
        if (currentFilter === 'pending') {
            await fetchTasks('pending');
            await fetchTasks('completed');
        }

    } catch (error) {
        console.error("Error updating task:", error);
    }
}


function renderTasks(tasks, filter) {
    let container;
    
    
    if (filter === 'pending') {
        container = pendingContainer;
    } else if (filter === 'completed') {
        container = completedContainer;
    } else {
        return; 
    }
    
    container.innerHTML = ''; 
    const today = new Date().toISOString().split('T')[0];
    
    tasks.forEach(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        if (taskDate !== today) {
            return; 
        }

        const item = document.createElement(filter === 'completed' ? 'li' : 'div');
        item.className = 'task-item';
        item.setAttribute('data-id', task.id);
        
        item.innerHTML = `<span>${task.content}</span>`;

        if (filter === 'pending') {
            
            const completeButton = document.createElement('button');
            completeButton.textContent = 'Complete';
            completeButton.className = 'complete-btn';
            
            completeButton.addEventListener('click', () => updateTaskStatus(task.id));

            item.appendChild(completeButton);
        } else if (filter === 'completed') {
            
            const checkmarkEmoji='✔️';
             item.innerHTML = `<span>${checkmarkEmoji} ${task.content}</span>`;
            item.classList.add('task-completed');
        }

        container.appendChild(item);
    });
    
    if (filter === 'pending' && tasks.length === 0) {
        container.innerHTML = '<p>No tasks currently pending.</p>';
    }
}

async function createTask(content) {
    
    try {
        const response = await fetch(apiBase + 'tasks', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ content: content })
        });
        if (!response.ok) {
            throw new Error(`Failed to create task. Status: ${response.status}`);
        }
        
       
        if (currentFilter === 'pending') {
            await fetchTasks('pending');
        }

    } catch (error) {
        console.error("Error creating task from spin:", error);
    }
}

function showErrorMessage(message) {
    const errorEl = document.getElementById('error');
    errorEl.innerText = message;
    errorEl.style.display = 'block';
    errorEl.style.color = '#EF476F'; 
    errorEl.style.marginBottom = '10px';
    errorEl.classList.add('shake');
    setTimeout(() => errorEl.classList.remove('shake'), 500);
}

async function authenticate() {
        const emailVal = email.value.trim();
    const passVal = password.value.trim();
    const usernameVal = username.value.trim();

    if (!emailVal || !emailVal.includes('@')) {
        return showErrorMessage("Please enter a valid email address.");
    }
    if (!passVal) {
        return showErrorMessage("Password cannot be empty.");
    }
    if (passVal.length < 8) {
        return showErrorMessage("Password must be at least 8 characters.");
    }
    if (isRegistration && !usernameVal) {
        return showErrorMessage("Please choose a username.");
    }

    // Reset UI for authentication attempt
    document.getElementById('error').style.display = 'none';
    isAuthenticating = true;
    authBtn.innerText = 'Authenticating...';

    try {
        let response;
        const payload = isRegistration 
            ? { email: emailVal, password: passVal, username: usernameVal }
            : { email: emailVal, password: passVal };

        const endpoint = isRegistration ? 'auth/register' : 'auth/login';

        response = await fetch(apiBase + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // 2. SERVER VALIDATION (Handle wrong password/email taken)
        if (!response.ok) {
            // Use the message from your backend if it exists, otherwise a default
            throw new Error(data.message || "Invalid email or password.");
        }

        if (data.token) {
            token = data.token;
            localStorage.setItem('token', token);
            authBtn.innerText = 'Loading...';
            showDashboard();
        }

    } catch (err) {
        console.error("Auth Error:", err.message);
        showErrorMessage(err.message);
    } finally {
        authBtn.innerText = 'Submit';
        isAuthenticating = false;
    }

}

async function toggleIsRegister() {

        isRegistration = !isRegistration
        document.getElementById('error').style.display = 'none';
    document.getElementById('error').innerText = '';
        registerBtn.innerText = isRegistration ? 'Sign in' : 'Sign up'
        document.querySelector('#auth > div h2').innerText = isRegistration ? 'Sign Up' : 'Login'
        document.querySelector('.register-content p').innerText = isRegistration ? 'Already have an account?' : 'Don\'t have an account?'
        document.querySelector('.register-content button').innerText = isRegistration ? 'Sign in' : 'Sign up'
        username.style.display=isRegistration ?'block':'none';
}

if (token) {
    async function run() {
        
        await fetchTasks('completed'); 
        signOut.innerText='LogOut';
        showDashboard(); 
    }
    run();
} else {
   
    showLogin();
}



   
    

   
 
