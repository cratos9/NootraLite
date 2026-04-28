document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('ia-form');
	const promptField = document.getElementById('ia-prompt');
	const submitButton = document.getElementById('ia-submit');
	const status = document.getElementById('ia-status');
	const chatBox = document.getElementById('ia-chat');
	const closeButton = document.getElementById('ia-close-btn');
	const newChatButton = document.getElementById('ia-new-chat');
	const changeButton = document.getElementById('ia-change-btn');
	const changeMenu = document.getElementById('ia-change-menu');
	const modeLabel = document.getElementById('ia-mode-label');
	const selectedMode = document.getElementById('ia-selected-mode');
	const modeOptions = document.querySelectorAll('.ia-change-option');
	const panel = document.getElementById('ia-panel');

	if (
		!form ||
		!promptField ||
		!submitButton ||
		!status ||
		!chatBox ||
		!closeButton ||
		!newChatButton ||
		!changeButton ||
		!changeMenu ||
		!modeLabel ||
		!selectedMode
	) {
		return;
	}

	const promptModes = {
		general: {
			label: 'General',
			prefix: '',
			placeholder: 'Escribe tu mensaje...'
		},
		resumen: {
			label: 'Resumen',
			prefix: 'Haz un resumen claro de lo siguiente: ',
			placeholder: 'Pega o describe el tema a resumir...'
		},
		ideas: {
			label: 'Ideas',
			prefix: 'Dame ideas concretas para desarrollar este tema: ',
			placeholder: 'Escribe el tema para generar ideas...'
		},
		cuestionario: {
			label: 'Cuestionario',
			prefix: 'Crea un cuestionario de 5 preguntas de opcion multiple sobre este tema. Incluye al final una seccion de respuestas correctas con explicacion breve: ',
			placeholder: 'Escribe el tema del cuestionario...'
		}
	};

	let activeMode = 'general';
	let menuCloseTimer = null;
	let currentConversationId = '';
	let historyExpanded = false;
	let conversations = [];
	const MAX_VISIBLE_HISTORY = 3;
	const defaultAssistantMessage = 'Hola, puedo ayudarte a aclarar conceptos o resumir tu nota.';

	const normalizeContextId = (rawValue) => {
		const value = String(rawValue ?? '').trim();
		if (!/^\d+$/.test(value)) {
			return '';
		}

		const parsed = Number.parseInt(value, 10);
		return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '';
	};

	const urlParams = new URLSearchParams(window.location.search);
	const context = {
		bookId: normalizeContextId(panel?.dataset?.bookId || urlParams.get('book_id'))
	};

	const withContextParams = (params) => {
		if (context.bookId) {
			params.set('book_id', context.bookId);
		}
		return params;
	};

	const setMode = (mode) => {
		const selected = promptModes[mode] ? mode : 'general';
		activeMode = selected;
		modeLabel.textContent = `Modo: ${promptModes[selected].label}`;
		selectedMode.textContent = promptModes[selected].label;
		promptField.placeholder = promptModes[selected].placeholder;

		modeOptions.forEach((option) => {
			option.classList.toggle('is-active', option.dataset.mode === selected);
		});
	};

	const clearChat = (withDefault = true) => {
		chatBox.innerHTML = '';
		if (withDefault) {
			addMessage(defaultAssistantMessage, 'assistant');
		}
	};

	const refreshIcons = () => {
		if (window.lucide && typeof window.lucide.createIcons === 'function') {
			window.lucide.createIcons({
				attrs: {
					'stroke-width': 1.8,
					stroke: 'currentColor'
				}
			});
		}
	};

	const deleteConversation = async (conversationId) => {
		if (!conversationId) {
			return;
		}

		const confirmed = window.confirm('Se eliminara esta conversacion. ¿Deseas continuar?');
		if (!confirmed) {
			return;
		}

		try {
			const body = withContextParams(new URLSearchParams({ conversation_id: conversationId }));
			const result = await fetch('../Notes/IADeleteConversation.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					'X-Requested-With': 'XMLHttpRequest'
				},
				body: body.toString()
			});

			const data = await result.json();
			if (!result.ok || !data.ok) {
				throw new Error(data.message || 'No se pudo eliminar la conversacion.');
			}

			conversations = conversations.filter((conversation) => conversation.conversation_id !== conversationId);

			if (currentConversationId === conversationId) {
				currentConversationId = '';
				clearChat();
				refreshHistorySurface();
			}

			showInlineHistory();
			status.textContent = 'Conversacion eliminada.';
		} catch (error) {
			status.textContent = error.message || 'No se pudo eliminar la conversacion.';
		}
	};

	const hasInlineHistory = () => Boolean(chatBox.querySelector('.ia-inline-history'));

	const showInlineHistory = () => {
		if (conversations.length === 0) {
			clearChat();
			return;
		}

		chatBox.innerHTML = '';

		const shell = document.createElement('section');
		shell.className = 'ia-inline-history';

		const head = document.createElement('div');
		head.className = 'ia-inline-history-head';

		const title = document.createElement('h3');
		title.textContent = 'Conversaciones recientes';
		head.appendChild(title);
		shell.appendChild(head);

		const list = document.createElement('div');
		list.className = 'ia-inline-history-list';
		const visibleItems = historyExpanded ? conversations : conversations.slice(0, MAX_VISIBLE_HISTORY);

		visibleItems.forEach((conversation) => {
			const row = document.createElement('div');
			row.className = 'ia-history-row';

			const openButton = document.createElement('button');
			openButton.type = 'button';
			openButton.className = 'ia-history-item ia-history-open';
			openButton.textContent = conversation.title;
			openButton.dataset.conversationId = conversation.conversation_id;
			openButton.classList.toggle('active', conversation.conversation_id === currentConversationId);
			openButton.addEventListener('click', () => {
				loadConversation(conversation.conversation_id);
			});

			const deleteButton = document.createElement('button');
			deleteButton.type = 'button';
			deleteButton.className = 'ia-history-delete';
			deleteButton.title = 'Eliminar conversacion';
			deleteButton.setAttribute('aria-label', 'Eliminar conversacion');
			deleteButton.innerHTML = '<i data-lucide="trash-2"></i>';
			deleteButton.addEventListener('click', (event) => {
				event.stopPropagation();
				deleteConversation(conversation.conversation_id);
			});

			row.appendChild(openButton);
			row.appendChild(deleteButton);
			list.appendChild(row);
		});

		shell.appendChild(list);

		if (conversations.length > MAX_VISIBLE_HISTORY) {
			const toggleButton = document.createElement('button');
			toggleButton.type = 'button';
			toggleButton.className = 'ia-inline-history-toggle';
			toggleButton.textContent = historyExpanded ? 'Menos' : 'Mas';
			toggleButton.addEventListener('click', () => {
				historyExpanded = !historyExpanded;
				showInlineHistory();
			});
			shell.appendChild(toggleButton);
		}

		chatBox.appendChild(shell);
		chatBox.scrollTop = 0;
		refreshIcons();
	};

	const refreshHistorySurface = () => {
		if (currentConversationId) {
			return;
		}

		if (promptField.value.trim() !== '') {
			return;
		}

		showInlineHistory();
	};

	const normalizeConversationTitle = (title) => {
		const cleanTitle = (title || '').trim();
		if (!cleanTitle) {
			return 'Conversacion sin titulo';
		}

		return cleanTitle.length > 80 ? `${cleanTitle.slice(0, 80)}...` : cleanTitle;
	};

	const normalizeRatingValue = (value) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}

		const parsed = Number.parseInt(String(value), 10);
		if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
			return null;
		}

		return parsed;
	};

	const normalizeHelpfulValue = (value) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}

		if (value === 1 || value === '1' || value === true || value === 'true') {
			return 1;
		}

		if (value === 0 || value === '0' || value === false || value === 'false') {
			return 0;
		}

		return null;
	};

	const submitMessageFeedback = async (order, rating, isHelpful) => {
		if (!currentConversationId || !order) {
			return;
		}

		const body = withContextParams(new URLSearchParams({
			conversation_id: currentConversationId,
			order: String(order)
		}));

		if (rating !== null) {
			body.set('rating', String(rating));
		}

		if (isHelpful !== null) {
			body.set('is_helpful', String(isHelpful));
		}

		const result = await fetch('../Notes/IARate.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'X-Requested-With': 'XMLHttpRequest'
			},
			body: body.toString()
		});

		const data = await result.json();
		if (!result.ok || !data.ok) {
			throw new Error(data.message || 'No se pudo guardar la calificacion.');
		}

		status.textContent = 'Calificacion guardada.';
	};

	const buildMetaText = (tokensUsed, responseTimeMs) => {
		const parts = [];
		if (tokensUsed !== null && tokensUsed !== undefined && tokensUsed !== '') {
			parts.push(`Tokens: ${tokensUsed}`);
		}
		if (responseTimeMs !== null && responseTimeMs !== undefined && responseTimeMs !== '') {
			parts.push(`Tiempo: ${responseTimeMs} ms`);
		}
		return parts.join(' | ');
	};

	const loadHistory = async () => {
		try {
			const historyQuery = withContextParams(new URLSearchParams());
			const result = await fetch(`../Notes/IAHistory.php?${historyQuery.toString()}`, {
				method: 'GET',
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				}
			});

			const data = await result.json();
			if (!result.ok || !data.ok) {
				throw new Error(data.message || 'No se pudo cargar el historial.');
			}

			conversations = (data.conversations || []).map((conversation) => ({
				conversation_id: conversation.conversation_id,
				title: normalizeConversationTitle(conversation.title)
			}));

			refreshHistorySurface();
		} catch (error) {
			status.textContent = error.message || 'Error al cargar historial.';
		}
	};

	const loadConversation = async (conversationId) => {
		if (!conversationId) {
			return;
		}

		try {
			status.textContent = 'Cargando conversacion...';
			const conversationQuery = withContextParams(new URLSearchParams({ conversation_id: conversationId }));
			const result = await fetch(`../Notes/IAConversation.php?${conversationQuery.toString()}`, {
				method: 'GET',
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				}
			});
			const data = await result.json();

			if (!result.ok || !data.ok) {
				throw new Error(data.message || 'No se pudo cargar la conversacion.');
			}

			currentConversationId = conversationId;
			chatBox.innerHTML = '';

			const turns = data.turns || [];
			if (turns.length === 0) {
				addMessage(defaultAssistantMessage, 'assistant');
			} else {
				turns.forEach((turn) => {
					addMessage(turn.query || '', 'user');
					addMessage(turn.response || '', 'assistant', {
						enableRating: true,
						order: turn.order,
						rating: turn.rating,
						isHelpful: turn.is_helpful,
						tokensUsed: turn.tokens_used,
						responseTimeMs: turn.response_time_ms
					});
				});
			}

			status.textContent = '';
		} catch (error) {
			status.textContent = error.message || 'Error al cargar mensajes.';
		}
	};

	const openChangeMenu = () => {
		if (menuCloseTimer) {
			clearTimeout(menuCloseTimer);
			menuCloseTimer = null;
		}

		changeMenu.hidden = false;
		changeMenu.classList.remove('is-closing');
		changeMenu.classList.add('is-open');
		changeButton.setAttribute('aria-expanded', 'true');
	};

	const closeChangeMenu = () => {
		if (changeMenu.hidden) {
			return;
		}

		if (menuCloseTimer) {
			clearTimeout(menuCloseTimer);
		}

		changeMenu.classList.remove('is-open');
		changeMenu.classList.add('is-closing');
		changeButton.setAttribute('aria-expanded', 'false');

		menuCloseTimer = setTimeout(() => {
			changeMenu.hidden = true;
			changeMenu.classList.remove('is-closing');
			menuCloseTimer = null;
		}, 150);
	};

	const toggleChangeMenu = () => {
		if (changeMenu.hidden) {
			openChangeMenu();
			return;
		}

		closeChangeMenu();
	};

	const closePanel = () => {
		if (typeof window.toggleIAPanel === 'function') {
			window.toggleIAPanel();
			return;
		}

		const panel = document.getElementById('ia-panel');
		if (panel) {
			panel.hidden = true;
		}
	};

	const escapeHtml = (value) => {
		return String(value)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	};

	const renderInlineMarkdown = (value) => {
		let safe = escapeHtml(value);
		safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
		safe = safe.replace(/`([^`]+?)`/g, '<code>$1</code>');
		return safe;
	};

	const renderMarkdownSafe = (value) => {
		const lines = String(value || '').replace(/\r\n/g, '\n').split('\n');
		const out = [];
		let inOl = false;
		let inUl = false;
		let inFence = false;
		let fenceBuffer = [];

		const isAsciiLine = (line) => {
			const trimmed = line.trim();
			if (!trimmed) {
				return false;
			}

			return /\|.*\||^(\[[^\]]+\]\s*)+$|^[\|\-+\s]+$/.test(trimmed);
		};

		const parseTableRow = (line) => {
			let normalized = String(line || '').trim();
			if (normalized.startsWith('|')) {
				normalized = normalized.slice(1);
			}
			if (normalized.endsWith('|')) {
				normalized = normalized.slice(0, -1);
			}

			return normalized.split('|').map((cell) => cell.trim());
		};

		const isTableSeparatorLine = (line) => {
			const cells = parseTableRow(line);
			if (cells.length === 0) {
				return false;
			}

			return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
		};

		const closeLists = () => {
			if (inOl) {
				out.push('</ol>');
				inOl = false;
			}
			if (inUl) {
				out.push('</ul>');
				inUl = false;
			}
		};

		for (let i = 0; i < lines.length; i += 1) {
			const rawLine = lines[i];
			const line = rawLine.trim();

			if (/^```/.test(line)) {
				if (!inFence) {
					closeLists();
					inFence = true;
					fenceBuffer = [];
				} else {
					out.push(`<pre class="ia-pre"><code>${escapeHtml(fenceBuffer.join('\n'))}</code></pre>`);
					inFence = false;
					fenceBuffer = [];
				}
				continue;
			}

			if (inFence) {
				fenceBuffer.push(rawLine);
				continue;
			}

			if (line.includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) {
				const headerCells = parseTableRow(rawLine);
				if (headerCells.length > 0) {
					closeLists();

					const tableRows = [];
					let j = i + 2;
					while (j < lines.length && lines[j].trim().includes('|')) {
						tableRows.push(parseTableRow(lines[j]));
						j += 1;
					}

					const thead = `<thead><tr>${headerCells.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr></thead>`;
					const tbodyRows = tableRows
						.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`)
						.join('');
					const tbody = `<tbody>${tbodyRows}</tbody>`;
					out.push(`<div class="ia-table-wrap"><table class="ia-table">${thead}${tbody}</table></div>`);
					i = j - 1;
					continue;
				}
			}

			if (isAsciiLine(rawLine)) {
				const block = [rawLine];
				let j = i + 1;
				while (j < lines.length && isAsciiLine(lines[j])) {
					block.push(lines[j]);
					j += 1;
				}

				if (block.length >= 2) {
					closeLists();
					out.push(`<pre class="ia-pre"><code>${escapeHtml(block.join('\n'))}</code></pre>`);
					i = j - 1;
					continue;
				}
			}

			if (!line) {
				closeLists();
				continue;
			}

			if (/^[-*_]{3,}$/.test(line)) {
				closeLists();
				out.push('<hr>');
				continue;
			}

			const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
			if (headingMatch) {
				closeLists();
				const level = headingMatch[1].length;
				out.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
				continue;
			}

			const olMatch = line.match(/^\d+\.\s+(.+)$/);
			if (olMatch) {
				if (!inOl) {
					if (inUl) {
						out.push('</ul>');
						inUl = false;
					}
					out.push('<ol>');
					inOl = true;
				}
				out.push(`<li>${renderInlineMarkdown(olMatch[1])}</li>`);
				continue;
			}

			const ulMatch = line.match(/^[-*]\s+(.+)$/);
			if (ulMatch) {
				if (!inUl) {
					if (inOl) {
						out.push('</ol>');
						inOl = false;
					}
					out.push('<ul>');
					inUl = true;
				}
				out.push(`<li>${renderInlineMarkdown(ulMatch[1])}</li>`);
				continue;
			}

			closeLists();
			out.push(`<p>${renderInlineMarkdown(line)}</p>`);
		}

		if (inFence) {
			out.push(`<pre class="ia-pre"><code>${escapeHtml(fenceBuffer.join('\n'))}</code></pre>`);
		}

		closeLists();
		const html = out.join('');
		if (!html) {
			return '<p></p>';
		}

		return html;
	};

	const renderAssistantMessage = (item, text, options = {}) => {
		const normalizedRating = normalizeRatingValue(options.rating);
		const normalizedHelpful = normalizeHelpfulValue(options.isHelpful);
		const order = Number.parseInt(String(options.order ?? ''), 10);
		const enableRating = Boolean(options.enableRating);

		item.innerHTML = `<div class="ia-markdown">${renderMarkdownSafe(text)}</div>`;

		const metaText = buildMetaText(options.tokensUsed, options.responseTimeMs);
		if (metaText) {
			const meta = document.createElement('div');
			meta.className = 'ia-meta';
			meta.textContent = metaText;
			item.appendChild(meta);
		}

		if (!enableRating || !Number.isFinite(order) || order <= 0) {
			return;
		}

		let currentRating = normalizedRating;
		let currentHelpful = normalizedHelpful;

		const actions = document.createElement('div');
		actions.className = 'ia-actions-row';

		const starsWrap = document.createElement('div');
		starsWrap.className = 'ia-stars';

		const helpfulWrap = document.createElement('div');
		helpfulWrap.className = 'ia-helpful';

		const helpfulYes = document.createElement('button');
		helpfulYes.type = 'button';
		helpfulYes.className = 'ia-helpful-btn';
		helpfulYes.textContent = 'Util';

		const helpfulNo = document.createElement('button');
		helpfulNo.type = 'button';
		helpfulNo.className = 'ia-helpful-btn';
		helpfulNo.textContent = 'No util';

		const starButtons = [];

		const paintState = () => {
			starButtons.forEach((button, idx) => {
				button.classList.toggle('active', currentRating !== null && idx < currentRating);
			});

			helpfulYes.classList.toggle('active', currentHelpful === 1);
			helpfulNo.classList.toggle('active', currentHelpful === 0);
		};

		for (let i = 1; i <= 5; i += 1) {
			const starButton = document.createElement('button');
			starButton.type = 'button';
			starButton.className = 'ia-star-btn';
			starButton.textContent = '★';
			starButton.setAttribute('aria-label', `Calificar ${i} de 5`);
			starButton.addEventListener('click', async () => {
				currentRating = i;
				paintState();
				try {
					await submitMessageFeedback(order, currentRating, currentHelpful);
				} catch (error) {
					status.textContent = error.message || 'No se pudo guardar la calificacion.';
				}
			});
			starButtons.push(starButton);
			starsWrap.appendChild(starButton);
		}

		helpfulYes.addEventListener('click', async () => {
			currentHelpful = 1;
			paintState();
			try {
				await submitMessageFeedback(order, currentRating, currentHelpful);
			} catch (error) {
				status.textContent = error.message || 'No se pudo guardar utilidad.';
			}
		});

		helpfulNo.addEventListener('click', async () => {
			currentHelpful = 0;
			paintState();
			try {
				await submitMessageFeedback(order, currentRating, currentHelpful);
			} catch (error) {
				status.textContent = error.message || 'No se pudo guardar utilidad.';
			}
		});

		helpfulWrap.appendChild(helpfulYes);
		helpfulWrap.appendChild(helpfulNo);
		actions.appendChild(starsWrap);
		actions.appendChild(helpfulWrap);
		item.appendChild(actions);

		paintState();
	};

	const addMessage = (text, role = 'assistant', options = {}) => {
		const item = document.createElement('div');
		item.className = `ia-message ia-${role}`;
		if (role === 'assistant') {
			renderAssistantMessage(item, text, options);
		} else {
			item.textContent = text;
		}
		chatBox.appendChild(item);
		chatBox.scrollTop = chatBox.scrollHeight;
		return item;
	};

	setMode(activeMode);
	clearChat();
	loadHistory();

	closeButton.addEventListener('click', closePanel);

	newChatButton.addEventListener('click', () => {
		currentConversationId = '';
		historyExpanded = false;
		clearChat();
		status.textContent = 'Nueva conversacion iniciada.';
		refreshHistorySurface();
		promptField.focus();
	});

	changeButton.addEventListener('click', (event) => {
		event.stopPropagation();
		toggleChangeMenu();
	});

	modeOptions.forEach((option) => {
		option.addEventListener('click', () => {
			setMode(option.dataset.mode || 'general');
			closeChangeMenu();
		});
	});

	document.addEventListener('click', (event) => {
		if (!changeMenu.hidden && !changeMenu.contains(event.target) && !changeButton.contains(event.target)) {
			closeChangeMenu();
		}
	});

	promptField.addEventListener('input', () => {
		if (promptField.value.trim() !== '' && hasInlineHistory()) {
			clearChat();
		}

		if (promptField.value.trim() === '' && !currentConversationId) {
			refreshHistorySurface();
		}
	});

	promptField.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			form.requestSubmit();
		}
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const prompt = promptField.value.trim();
		if (!prompt) {
			status.textContent = 'Escribe una pregunta antes de enviar.';
			return;
		}

		const composedPrompt = `${promptModes[activeMode].prefix}${prompt}`;
		if (hasInlineHistory()) {
			chatBox.innerHTML = '';
		}
		addMessage(prompt, 'user');
		promptField.value = '';

		submitButton.disabled = true;
		status.textContent = 'Consultando a la IA...';
		const loadingMessage = addMessage('Escribiendo...', 'assistant', { enableRating: false });

		try {
			const body = withContextParams(new URLSearchParams({
				prompt: composedPrompt,
				raw_prompt: prompt,
				mode: activeMode,
				conversation_id: currentConversationId
			}));
			const result = await fetch('../Notes/AskIA.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					'X-Requested-With': 'XMLHttpRequest'
				},
				body: body.toString()
			});

			const data = await result.json();

			if (!result.ok || !data.ok) {
				throw new Error(data.message || 'No se pudo obtener respuesta.');
			}

			if (data.conversation_id) {
				currentConversationId = data.conversation_id;
			}

			renderAssistantMessage(loadingMessage, data.response || 'Sin respuesta de la IA.', {
				enableRating: true,
				order: data.order,
				rating: data.rating,
				isHelpful: data.is_helpful,
				tokensUsed: data.tokens_used,
				responseTimeMs: data.response_time_ms
			});
			status.textContent = 'Respuesta lista.';
			await loadHistory();
		} catch (error) {
			renderAssistantMessage(loadingMessage, 'No pude responder esta vez. Intenta de nuevo.', {
				enableRating: false
			});
			status.textContent = error.message || 'Error inesperado al consultar la IA.';
		} finally {
			submitButton.disabled = false;
			promptField.focus();
		}
	});
});
