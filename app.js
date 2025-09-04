// Initialize Supabase
const SUPABASE_URL = "https://pwjvisderoyqbbxifzrw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3anZpc2Rlcm95cWJieGlmenJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzM3MzksImV4cCI6MjA3MTYwOTczOX0.eesSF4krIK1HkNNwjoIsy6bOk2MS73CKCaUV__T4ewA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------<<< Global Elements >>>----------

let allTodos = []
let currentUser = null
let editState = { id: null }

// ----------<<< Search Section >>>----------

let searchTodosInp = document.getElementById("searchTodosInp")

searchTodosInp.addEventListener("input" , () => {

    let searchTxt = searchTodosInp.value.toLowerCase()
    let filtered = allTodos.filter(todo => {
        return todo.task.toLowerCase().includes(searchTxt)
    })
    renderTasks(filtered)
    
})

// ----------<<< Auth: SignUp, LogIn and LogOut Section >>>----------

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

// // ----------<<< Auth State Change Listener >>>----------
// supabase.auth.onAuthStateChange(async (event, session) => {

//     if (session) {
//         currentUser = session.user.id;
//         loginSec.classList.add("hidden");
//         todoSec.classList.remove("hidden");
//         loadTasks();
//     }
//     else {
//         currentUser = null;
//         loginSec.classList.remove("hidden");
//         todoSec.classList.add("hidden");
//     }
    
// });

signUpBtn.addEventListener("click" , async () => {

    const { error } = await supabase.auth.signUp({
        email: emailInp.value,
        password: passInp.value,
    })
    if (error) {
        alert(error.message)
        return
    }

    alert("Please check your email to verify.");
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
        return
    }
    
    currentUser = data.user.id || data.session.user.id
    // currentUser = data.session.user.id
    loginSec.classList.add("hidden")
    todoSec.classList.remove("hidden")
    
    emailInp.value = ""
    passInp.value = ""

    await loadTasks()
    alert("Logged In!");

})

logOutBtn.addEventListener("click" , async () => {

    await supabase.auth.signOut()
    currentUser = null
    loginSec.classList.remove("hidden")
    todoSec.classList.add("hidden")
    taskList.innerHTML = ""

})

// ----------<<< Check User Session on Page Load >>>----------

window.addEventListener("DOMContentLoaded", async () => {

    // start with loading
    loginSec.classList.add("hidden")
    todoSec.classList.add("hidden")

    const { data } = await supabase.auth.getSession()
    console.log(data);
    
    if (data.session) {
        currentUser = data.session.user.id
        await loadTasks()
        loginSec.classList.add("hidden")
        todoSec.classList.remove("hidden")
    }
    else {
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

// CRUD [Create, Read, Update, Delete] OPERATIONS

let renderTasks = (todos) => {
    taskList.innerHTML = ""

    if (todos.length === 0) {
        taskList.innerHTML = `<p class="text-slate-400">No todos yet</p>`
        return;
    }

    todos.forEach(item => {

        // Create Todo <li>
        let li = document.createElement("li")
        li.className = "flex flex-row justify-between bg-gray-900 px-6 py-5 rounded-xl"

        // Todo Texts Div
        let txtDiv = document.createElement("div")
        txtDiv.className = "flex flex-col"

        // Todo Text
        let titleTxt = document.createElement("p")
        titleTxt.className = "text-lg font-medium"
        titleTxt.textContent = item.task

        // Todo Description
        let descrpTxt = document.createElement("p")
        descrpTxt.className = "text-md font-light"
        descrpTxt.textContent = item.description

        txtDiv.appendChild(titleTxt)
        txtDiv.appendChild(descrpTxt)

        // ---- Images ----
        if (item.images && item.images.length > 0) {

            let imgDiv = document.createElement("div");
            imgDiv.className = "grid grid-cols-3 gap-2 mt-2";

            if (Array.isArray(item.images)) {
                item.images.forEach(url => {
                    let img = document.createElement("img");
                    img.src = url;
                    img.className = "w-full h-24 object-cover rounded-lg border border-slate-700";
                    imgDiv.appendChild(img);
                });
            }
            
            txtDiv.appendChild(imgDiv);

        }

        // Todo Btn Div
        let btnDiv = document.createElement("div")
        btnDiv.className = "flex flex-row space-x-4"

        // ---- Edit Todo Btn ----
        let editBtn = document.createElement("button")
        editBtn.className = "text-green-500 hover:cursor-pointer hover:text-green-600"
        editBtn.textContent = "Edit"
        editBtn.onclick = () => {

            taskTitleInp.value = item.task
            taskDescrpInp.value = item.description
            addTodosBtn.textContent = "Save Changes"
            editState.id = item.id
            uploadedImgUrls = item.images || [];
            displExistingImg(uploadedImgUrls);

        }

        // ---- Delete Todo Btn ----
        let deletBtn = document.createElement("button")
        deletBtn.className = "text-red-600 hover:cursor-pointer hover:text-red-700"
        deletBtn.textContent = "Delete"
        deletBtn.onclick = async () => {

            if (!confirm("Delete this task?")) return

            // images delete in storage [Bucket]
            if (item.images && item.images.length > 0) {
                await deleteImgsFrmStorg(item.images || []);
            }
            
            let { error } = await supabase.from("Todo_App")
            .delete()
            .eq("id", item.id)
            .eq("user_id", currentUser)

            if (error) {
                alert(error.message)
                return
            }
            await loadTasks()

        }

        btnDiv.appendChild(editBtn)
        btnDiv.appendChild(deletBtn)

        li.appendChild(txtDiv)
        li.appendChild(btnDiv)
        taskList.appendChild(li)

    })

}

async function loadTasks() {

    let {data , error} = await supabase
    .from("Todo_App")
    .select("id , task , description , images")
    .eq("user_id", currentUser)
    
    if (error) {
        console.log("loadTasks => " , error)
        return
    }

    allTodos = data
    renderTasks(allTodos)

}

// ----------<<< Add / Update Todos Section >>>----------

addTodosBtn.addEventListener("click", async () => {

    if (!currentUser) return alert("Login required!")

    let title = taskTitleInp.value.trim()
    let descrp = taskDescrpInp.value.trim()
    if (!title) return

    // --- Upload images pehle ---
    let imgUrls = await upldImgToStorage();

    if (editState.id) {

        // ----- Update existing todo -----
        let { error } = await supabase.from("Todo_App")
        .update({
            task: title,
            description: descrp,
            images: imgUrls.length > 0 ? imgUrls : uploadedImgUrls
        })
        .eq("id", editState.id)
        .eq("user_id", currentUser)

        if (error) {
            alert(error.message)
            return
        }
        addTodosBtn.textContent = "Add Todo"
        editState.id = null
        uploadedImgUrls = [];

    }
    else {

        // ----- Insert new todo -----
        let { error } = await supabase
        .from("Todo_App")
        .insert([{
            task: title,
            description: descrp,
            user_id: currentUser,
            images: imgUrls
        }])

        if (error) {
            alert(error.message)
            return;
        }
        
    }

    // Clear inputs
    taskTitleInp.value = ""
    taskDescrpInp.value = ""
    clearImgSelection();
    await loadTasks()

});

// ----------<<< IMAGE UPLOAD FUNCTIONALITY >>>----------

// Image upload Global Elements
let selectedImages = [];
let uploadedImgUrls = [];

// Elements
let imgupldArea = document.getElementById("imgupldArea")
let imgInp = document.getElementById("imgInp")
let imgPreviewCont = document.getElementById("imgPreviewCont")

// Drag and drop functionality
imgupldArea.addEventListener('dragover', (e) => {

    e.preventDefault();
    imgupldArea.classList.add('border-emerald-500', 'bg-slate-800/30');

});

imgupldArea.addEventListener('dragleave', (e) => {

    e.preventDefault();
    imgupldArea.classList.remove('border-emerald-500', 'bg-slate-800/30');

});

imgupldArea.addEventListener('drop', (e) => {

    e.preventDefault();
    imgupldArea.classList.remove('border-emerald-500', 'bg-slate-800/30');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handlImgSelection(files);

});

// File input [change]
imgInp.addEventListener('change', (e) => {

    const files = Array.from(e.target.files);
    handlImgSelection(files);

});

// Handle image selection
function handlImgSelection(files) {

    const validFiles = files.filter(file => {

        if (!file.type.startsWith('image/')) {
            alert('Please select only image files');
            return false;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert(`File ${file.name} is too large. Maximum size is 10MB`);
            return false;
        }
        return true;

    });

    selectedImages = [...selectedImages, ...validFiles];
    displImgPreviews();

}

// Display image previews
function displImgPreviews() {

    imgPreviewCont.innerHTML = '';
    
    if (selectedImages.length === 0) {
        imgPreviewCont.classList.add('hidden');
        return;
    }

    imgPreviewCont.classList.remove('hidden');

    selectedImages.forEach((file, index) => {
        
        let previewDiv = document.createElement('div');
        previewDiv.className = 'relative group';
        
        let img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'w-50 h-28 object-cover rounded-lg border border-slate-700 hover:cursor-pointer';
        
        let removeBtn = document.createElement('button');
        removeBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        `;
        removeBtn.className = 'absolute -top-2 right-5 p-1 text-white rounded-full bg-red-600 hover:cursor-pointer group-hover:opacity-100';
        removeBtn.onclick = () => removeImage(index);
        
        let fileName = document.createElement('p');
        fileName.textContent = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
        fileName.className = 'text-xs text-slate-400 mt-1 truncate';
        
        previewDiv.appendChild(img);
        previewDiv.appendChild(removeBtn);
        previewDiv.appendChild(fileName);
        imgPreviewCont.appendChild(previewDiv);
        
    });
    
}

// Remove image from selection
function removeImage(index) {

    selectedImages.splice(index, 1);
    displImgPreviews();

}

// Upload images to Supabase Storage
async function upldImgToStorage() {
    
    if (selectedImages.length === 0) return []; 

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let uploadDetails = selectedImages.map( async (file, index) => {

        // Unique file name
        let fileExtn = file.name.split(".").pop();
        let fileName = `${user.id}/${Date.now()}-${index}.${fileExtn}`

        // Upload file
        const { error } = await supabase.storage
        .from("Img-File-Collection")
        .upload(fileName, file)

        if (error) {
            alert("Error Upload failed: " + error.message)
            return null;
        }

        // Get public URL
        let { data } = supabase.storage
        .from("Img-File-Collection")
        .getPublicUrl(fileName)

        return data.publicUrl;

    })

    let results = await Promise.all(uploadDetails)
    return results.filter(url => url !== null);

}

// Clear image selection
function clearImgSelection() {
    selectedImages = [];
    uploadedImgUrls = [];
    imgInp.value = '';
    displImgPreviews();
}

// Display existing images during editing
function displExistingImg(imgUrls) {
    
    imgPreviewCont.innerHTML = '';
    imgPreviewCont.classList.remove('hidden');

    imgUrls.forEach((imageUrl, index) => {

        let previewDiv = document.createElement('div');
        previewDiv.className = 'relative group';

        let img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'w-full h-24 object-cover rounded-lg border border-slate-700';
        
        let removeBtn = document.createElement('button');
        removeBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        `;
        removeBtn.className = 'absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100';
        removeBtn.onclick = () => removeExistingImage(index);
        
        let fileName = document.createElement('p');
        fileName.textContent = `Existing Image ${index + 1}`;
        fileName.className = 'text-xs text-slate-400 mt-1 truncate';

        previewDiv.appendChild(img);
        previewDiv.appendChild(removeBtn);
        previewDiv.appendChild(fileName);
        imgPreviewCont.appendChild(previewDiv);
        
    })

}

// Delete images from Supabase Storage
async function deleteImgsFrmStorg(imgUrls) {
    
    if (!imgUrls || imgUrls.length === 0) return;
    
    // Supabase public URL convert to storage path
    let paths = imgUrls.map(url => url.split("/Img-File-Collection/")[1]);
    
    const { error } = await supabase.storage
    .from("Img-File-Collection")
    .remove(paths);
    
    if (error) {
        console.log("Image delete error:", error.message);
    }
        

}

// Remove existing image from edit
async function removeExistingImage(index) {

    // 1. delete from storage
    let imgUrl = uploadedImgUrls[index];
    await deleteImgsFrmStorg([imgUrl]);

    // 2. remove from list
    uploadedImgUrls.splice(index, 1);

    // 3. UI update
    if (uploadedImgUrls.length === 0) {
        imgPreviewCont.classList.add('hidden');
    }
    else {
        displExistingImg(uploadedImgUrls);
    }

}