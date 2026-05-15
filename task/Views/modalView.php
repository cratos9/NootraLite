<div id="taskModal" class="task-modal">

    <div class="task-modal-content">

        <div class="task-modal-header">

            <h2>Nueva tarea</h2>

            <button id="closeTaskModal">
                ✕
            </button>

        </div>

        <form
            id="taskForm"
            action="Controllers/TaskController.php?action=create"
            method="POST"
        >

            <input
                type="hidden"
                name="id"
                id="taskId"
            >

            <label>Título</label>

            <input
                type="text"
                name="title"
                placeholder="Examen parcial"
                required
            >

            <label>Descripción</label>

            <textarea
                name="description"
                placeholder="Descripción de la tarea"
            ></textarea>

            <div class="task-grid">

                <div>

                    <label>Prioridad</label>

                    <select name="priority" class="priority-select">

    <option value="low">
        🟢 Baja
    </option>

    <option value="medium" selected>
        🟡 Media
    </option>

    <option value="high">
        🔴 Alta
    </option>

</select>

                </div>

                <div>

                    <label>Categoría</label>

                    <input
                        type="text"
                        name="category"
                        placeholder="Escuela"
                    >

                </div>

            </div>

            <label>Tags</label>

            <input
                type="text"
                name="tags"
                placeholder="Examen, cálculo"
            >

            <div class="task-grid">

                <div>

                    <label>Inicio</label>

                    <input
                        type="datetime-local"
                        name="start_dt"
                        required
                    >

                </div>

                <div>

                    <label>Fin</label>

                    <input
                        type="datetime-local"
                        name="end_dt"
                    >

                </div>

            </div>

            <label class="all-day-label">

                <input
                    type="checkbox"
                    name="all_day"
                >

                Todo el día

            </label>

            <div class="task-actions">

                <button
                    type="button"
                    id="cancelTaskModal"
                    class="cancel-btn"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    class="save-btn"
                >
                    Guardar tarea
                </button>

            </div>

        </form>

    </div>

</div>