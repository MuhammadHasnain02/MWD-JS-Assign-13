// Initialize Supabase
const SUPABASE_URL = "https://unexbrmjvvwhynrulhhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXhicm1qdnZ3aHlucnVsaGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDgwODMsImV4cCI6MjA3MTU4NDA4M30.sZrKu_W0Ph8iq6FeNAeggX9bT7C4-odfkz0IedbhVQw";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Buttons & Elements
let addBtn = document.getElementById("addBtn")
let editBtn = document.getElementById("editBtn")
let deletBtn = document.getElementById("deletBtn")
let taskInp = document.getElementById("taskInput")
let taskList = document.getElementById("taskList")

let loadTasks = async () => {
    let {data , error} = await supabase.from("todo-app").select("id , task")

    taskList.innerHTML = ""

    if (data && !error) {
        
        data.forEach(item => {
            // create <li>
            let li = document.createElement("li")
            li.className = "text-[16px] font-medium flex justify-between items-center bg-gray-200 px-4 py-3 rounded-md"
            li.textContent = item.task
            
            // li buttons div
            let btnDiv = document.createElement("div")

            // li buttons
            let editbtn = document.createElement("button")
            editbtn.textContent = "📝"
            editbtn.className = "text-[18px] ml-3 rounded transition duration-400 hover:cursor-pointer hover:scale-110"

            let deletbtn = document.createElement("button")
            deletbtn.textContent = "🗑️"
            deletbtn.className = "text-[18px] ml-3 rounded transition duration-400 hover:cursor-pointer hover:scale-110"

            // btn div childs
            btnDiv.appendChild(editbtn)
            btnDiv.appendChild(deletbtn)    

            // li child
            li.appendChild(btnDiv)

            // ul child
            taskList.appendChild(li)
        })
    }

}

// Get Data Button EventListener
addBtn.addEventListener("click", async () => {

    let task = taskInp.value

    if (!task) {
        return
    }
    else {
        await supabase.from("todo-app").insert([{ task }])
        taskInp.value = ""
        loadTasks()
    }

})
// Page load show tasks
loadTasks()