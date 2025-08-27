// Initialize Supabase
const SUPABASE_URL = "https://pwjvisderoyqbbxifzrw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3anZpc2Rlcm95cWJieGlmenJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzM3MzksImV4cCI6MjA3MTYwOTczOX0.eesSF4krIK1HkNNwjoIsy6bOk2MS73CKCaUV__T4ewA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------<<< Globals >>>----------
let allTodos = []
let currentUser = null

// ----------<<< Search Section >>>----------

let searchTodosInp = document.getElementById("searchTodosInp")

searchTodosInp.addEventListener("input" , () => {

    let searchTxt = searchTodosInp.value.toLowerCase()
    let filtered = allTodos.filter(todo => {
        return todo.task.toLowerCase().includes(searchTxt)
    })
    renderTasks(filtered)
    
})

// ----------<<< SignUp and LogIn Section >>>----------

// Email and Password Input
let emailInp = document.getElementById("emailInp")
let passInp = document.getElementById("passInp")
// Signup and LogIn | LogOut Btns
let signUpBtn = document.getElementById("signUpBtn")
let logInBtn = document.getElementById("logInBtn")
let logOutBtn = document.getElementById("logOutBtn")
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
    else {
        console.log("Signed Up:", data)
        currentUser = data.user ?.id || data.session?.user.id
    }

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
        console.log("Logged In:", data)
        currentUser = data.user?.id || data.session?.user.id
        loginSec.classList.add("hidden")
        todoSec.classList.remove("hidden")
        loadTasks()
    }

    emailInp.value = ""
    passInp.value = ""

})

logOutBtn.addEventListener("click" , async () => {
    await supabase.auth.signOut()
    loginSec.classList.remove("hidden")
    todoSec.classList.add("hidden")
})

// ----------<<< Check User Session on Page Load >>>----------

window.addEventListener("DOMContentLoaded", async () => {

    // start with loading
    loginSec.classList.add("hidden")
    todoSec.classList.add("hidden")

    const { data } = await supabase.auth.getSession()
    
    if (data.session) {
        currentUser = data.session.user.id
        // user already login
        loginSec.classList.add("hidden")
        todoSec.classList.remove("hidden")
        loadTasks()
    }
    else {
        currentUser = null
        // user not login
        loginSec.classList.remove("hidden")
        todoSec.classList.add("hidden")
    }

})

// ----------<<< Todo Details Section >>>----------

// Elements
let taskTitleInp = document.getElementById("taskTitleInp")
let taskDescrpInp = document.getElementById("taskDescrpInp")
let addTodosBtn = document.getElementById("addTodosBtn")

let taskList = document.getElementById("taskList")
let editBtn  = document.getElementById("editBtn")
let deletBtn = document.getElementById("deletBtn")

let renderTasks = (todos) => {
    taskList.innerHTML = ""

    todos.forEach(item => {
        let li = document.createElement("li")
        li.className = "flex flex-row justify-between bg-gray-900 px-6 py-5 rounded-xl"

        let txtDiv = document.createElement("div")
        txtDiv.className = "flex flex-col"

        let titleTxt = document.createElement("p")
        titleTxt.className = "text-lg font-medium"
        titleTxt.textContent = item.task

        let descrpTxt = document.createElement("p")
        descrpTxt.className = "text-md font-light"
        descrpTxt.textContent = item.description

        txtDiv.appendChild(titleTxt)
        txtDiv.appendChild(descrpTxt)

        let btnDiv = document.createElement("div")
        btnDiv.className = "flex flex-row space-x-4"

        let editBtn = document.createElement("button")
        editBtn.className = "text-green-500 hover:cursor-pointer hover:text-green-600"
        editBtn.textContent = "Edit"

        let deletBtn = document.createElement("button")
        deletBtn.className = "text-red-600 hover:cursor-pointer hover:text-red-700"
        deletBtn.textContent = "Delete"

        btnDiv.appendChild(editBtn)
        btnDiv.appendChild(deletBtn)

        li.appendChild(txtDiv)
        li.appendChild(btnDiv)
        taskList.appendChild(li)
    })
}

let loadTasks = async () => {

    let {data , error} = await supabase
    .from("Todo_App")
    .select("id , task , description")
    .eq("user_id", currentUser)
    
    if (data && !error) {
        allTodos = data
        renderTasks(allTodos)
    }

}

// ----------<<< Add Todos Section >>>----------

addTodosBtn.addEventListener("click", async () => {

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        alert("Please login first!")
        return
    }

    let task = taskTitleInp.value
    let description = taskDescrpInp.value

    if (!task) {
        return
    }

    let { error } = await supabase.from("Todo_App").insert([{
        task: task,
        description: description,
        user_id: data.user.id
    }])

    if (error) {
        alert(error.message)
        return
    }

    taskTitleInp.value = ""
    taskDescrpInp.value = ""
    loadTasks()

});

// Page load show tasks
loadTasks()