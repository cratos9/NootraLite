<!DOCTYPE html>
<html lang="es-MX">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

    <script src="../js/includes/lightMode.js" defer></script>

    <script src="../js/includes/toast.js"></script>

    <link rel="stylesheet" href="../css/includes/toast.css">

    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
        rel="stylesheet"
    >

    <link rel="stylesheet" href="../css/task/index.css">

    <link rel="stylesheet" href="../css/includes/sidebar.css">

    <link rel="stylesheet" href="../css/includes/lightMode.css">

    <title>Tareas</title>

</head>

<body>

<header>

    <div class="task-header">

        <div>

            <h1>Mis tareas</h1>

            <p>
                Bienvenido,
                <?= htmlspecialchars($_SESSION['user']['username']) ?>
            </p>

        </div>

        <button
            id="openTaskModal"
            class="new-task-btn"
        >
            Nueva tarea
        </button>

    </div>

</header>

<main>

    <div class="task-list">

        <?php foreach($tasks as $task): ?>

            <div class="task-card">

                <div class="task-top">

                    <div>

                        <h3>
                            <?= htmlspecialchars(decrypt_data($task['title'])) ?>
                        </h3>

                        <p>
                            <?= htmlspecialchars(decrypt_data($task['description'])) ?>
                        </p>

                    </div>

                    <div class="task-buttons">

                        <button
                            class="edit-btn"
                            onclick='openEditModal(
                                <?= $task["id"] ?>,
                                <?= json_encode(decrypt_data($task["title"])) ?>,
                                <?= json_encode(decrypt_data($task["description"])) ?>,
                                <?= json_encode($task["priority"]) ?>,
                                <?= json_encode(decrypt_data($task["category"])) ?>,
                                <?= json_encode(decrypt_data($task["tags"])) ?>,
                                <?= json_encode($task["start_datetime"]) ?>,
                                <?= json_encode($task["end_datetime"]) ?>
                            )'
                        >
                            Editar
                        </button>

                        <a
                            href="Controllers/TaskController.php?action=delete&id=<?= $task['id'] ?>"
                            class="delete-btn"
                            onclick="return confirm('¿Eliminar tarea?')"
                        >
                            Eliminar
                        </a>

                    </div>

                </div>

                <div class="task-meta">

                    <span class="priority">
                        <?= $task['priority'] ?>
                    </span>

                    <span>
                        <?= $task['start_datetime'] ?>
                    </span>

                </div>

            </div>

        <?php endforeach; ?>

    </div>

</main>

<?php include 'modalView.php'; ?>

<script src="../js/task/task.js"></script>

<script>
    lucide.createIcons({
        attrs: {
            'stroke-width': 1.6,
            stroke: 'currentColor'
        }
    });
</script>

<script src="../js/includes/sidebar.js"></script>

</body>
</html>