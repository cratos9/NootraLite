const modal = document.getElementById("taskModal");

const openBtn = document.getElementById("openTaskModal");

const closeBtn = document.getElementById("closeTaskModal");

const cancelBtn = document.getElementById("cancelTaskModal");

const form = document.getElementById("taskForm");

openBtn.addEventListener("click", () => {

    resetModal();

    modal.style.display = "flex";

});

closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

cancelBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if(e.target === modal){

        modal.style.display = "none";

    }

});

function openEditModal(
    id,
    title,
    description,
    priority,
    category,
    tags,
    start_dt,
    end_dt
){

    modal.style.display = "flex";

    form.action =
        "Controllers/TaskController.php?action=update";

    document.getElementById("taskId").value = id;

    document.querySelector("[name='title']").value = title;

    document.querySelector("[name='description']").value =
        description;

    document.querySelector("[name='priority']").value =
        priority;

    document.querySelector("[name='category']").value =
        category;

    document.querySelector("[name='tags']").value =
        tags;

    document.querySelector("[name='start_dt']").value =
        start_dt.replace(" ", "T");

    if(end_dt){

        document.querySelector("[name='end_dt']").value =
            end_dt.replace(" ", "T");

    }

}

function resetModal(){

    form.reset();

    form.action =
        "Controllers/TaskController.php?action=create";

    document.getElementById("taskId").value = "";

}