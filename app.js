// Initialize Supabase
const SUPABASE_URL = "https://pwjvisderoyqbbxifzrw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3anZpc2Rlcm95cWJieGlmenJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzM3MzksImV4cCI6MjA3MTYwOTczOX0.eesSF4krIK1HkNNwjoIsy6bOk2MS73CKCaUV__T4ewA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------<<< Signip and signin Section >>>----------

// Email and Password Input
let emailInp = document.getElementById("emailInp")
let passInp = document.getElementById("passInp")
// Signup and Login Btns
let signUpBtn = document.getElementById("signUpBtn")
let logInBtn = document.getElementById("logInBtn")
// show OR hide
let loginSec = document.getElementById("loginSec")
let todoSec = document.getElementById("todoSec")

signUpBtn.addEventListener("click" , async () => {

    const { data, error } = await supabase.auth.signUp({
        email: emailInp.value,
        password: passInp.value,
    })
    if (error) {
        alert(error.message)
    }
    console.log(data)

    emailInp.value = ""
    passInp.value = ""
})

logInBtn.addEventListener("click" , async () => {

    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInp.value,
        password: passInp.value,
    })
    if (error) {
        alert(error.message)
    }
    else {
        console.log(data)
        loginSec.classList.add("hidden")
        todoSec.classList.remove("hidden")
    }

    emailInp.value = ""
    passInp.value = ""
})

// ----------<<< Todo Details Section >>>----------



// ----------<<< Add Todos Section >>>----------

// Buttons & Elements
let addBtn = document.getElementById("addBtn")
let taskList = document.getElementById("taskList")
let editBtn = document.getElementById("editBtn")
let deletBtn = document.getElementById("deletBtn")

let loadTasks = async () => {
    let {data , error} = await supabase.from("Todo-App").select("id , task , description")

    taskList.innerHTML = ""

    if (data && !error) {
        
        data.forEach(item => {
            // create <li>
            let li = document.createElement("li")
            li.className = "flex flex-row justify-between bg-gray-900 px-6 py-5 rounded-xl"

            // Text Div
            let txtDiv = document.createElement("div")
            txtDiv.className = "flex flex-col"

            // Text Div Childs
            let titleTxt = document.createElement("p")
            titleTxt.className = "text-lg font-medium"
            titleTxt.textContent = item.task

            let descrpTxt = document.createElement("p")
            descrpTxt.className = "text-md font-normal"
            descrpTxt.textContent = item.description

            txtDiv.appendChild(titleTxt)
            txtDiv.appendChild(descrpTxt)

            // Button Div
            let btnDiv = document.createElement("div")
            btnDiv.className = "flex flex-row space-x-4"

            // Button Div Childs
            let editBtn = document.createElement("button")
            editBtn.className = "text-green-500 hover:cursor-pointer hover:text-green-600"
            editBtn.textContent = "Edit"

            let deletBtn = document.createElement("button")
            deletBtn.className = "text-red-600 hover:cursor-pointer hover:text-red-700"
            deletBtn.textContent = "Delete"

            btnDiv.appendChild(editBtn)
            btnDiv.appendChild(deletBtn)

            
            // li childs
            li.appendChild(txtDiv)
            li.appendChild(btnDiv)

            // ul child
            taskList.appendChild(li)
        })
    }

}

// Get Data Button EventListener
addBtn.addEventListener("click", async () => {

    let task = taskTitleInp.value

    if (!task) {
        return
    }
    else {
        await supabase.from("Todo-App").insert([{ task }])
        taskTitleInp.value = ""
        loadTasks()
    }

})
// Page load show tasks
loadTasks()