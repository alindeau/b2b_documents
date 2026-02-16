const SizeStyle = Quill.import('attributors/style/size');
SizeStyle.whitelist = null;
Quill.register(SizeStyle, true);

const ColorStyle = Quill.import('attributors/style/color');
Quill.register(ColorStyle, true);

const AlignStyle = Quill.import('attributors/style/align');
Quill.register(AlignStyle, true);

const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['image', 'clean']
        ],
        clipboard: {
            matchVisual: false
        }
    }
});

quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    delta.ops.forEach(op => {
        if (op.attributes) {
            if (op.attributes.size && op.attributes.size.includes('pt')) {
                let ptSize = parseFloat(op.attributes.size);
                op.attributes.size = Math.round(ptSize * 1.33) + "px";
            }
        
            if (['H1', 'H2', 'H3'].includes(node.tagName)) {
                op.attributes.bold = true;
            }
        }
    });
    return delta;
});

window.addEventListener('message', (event) => {
    if (event.data.action === "open") {
        document.body.classList.remove('hidden');
        
        const title = event.data.title || "Document sans titre";
        const content = event.data.content || "";
        const isLocked = (event.data.locked === true || event.data.locked === 1);

        document.getElementById('docTitle').value = title;
        quill.root.innerHTML = content;

        if (isLocked) {
            quill.enable(false);
            document.getElementById('docTitle').disabled = true;
            document.querySelector('.ql-toolbar').style.display = 'none';
            
            const btns = document.querySelectorAll('.btn-action');
            btns.forEach(b => {
                if (!b.innerHTML.includes('fa-times')) {
                    b.style.display = 'none';
                }
            });
        } else {
            quill.enable(true);
            document.getElementById('docTitle').disabled = false;
            document.querySelector('.ql-toolbar').style.display = 'block';
            
            const btns = document.querySelectorAll('.btn-action');
            btns.forEach(b => b.style.display = 'flex');
        }
    }
});

window.addEventListener('message', (event) => {
    if (event.data.type === "open") {
        document.body.classList.remove('hidden');
        
        const container = document.querySelector('.relative');
        container.classList.remove('animate-fadeIn', 'animate-slideUp', 'animate-zoomIn', 'animate-none');
        if (event.data.animation) {
            container.classList.add('animate-' + event.data.animation);
        }

        document.getElementById('docTitle').value = event.data.title || "";
        
        if (event.data.content && event.data.content !== "") {
            quill.clipboard.dangerouslyPasteHTML(event.data.content);
        } else {
            quill.setContents([]);
        }
    }
});

function closeUI() {
    document.body.classList.add('hidden'); 
    fetch(`https://${GetParentResourceName()}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
}

function triggerAction(actionType) {
    const contentHtml = quill.root.innerHTML;
    const docTitle = document.getElementById('docTitle').value || "Sans Titre";

    if (actionType === 'duplicate') {
        const modal = document.getElementById('duplicateModal');
        if (modal) modal.classList.add('hidden');
        
        closeUI(); 
    }

    fetch(`https://${GetParentResourceName()}/doAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: actionType,
            content: contentHtml,
            title: docTitle
        })
    }).then(resp => resp.json()).then(success => {
        if (success) {
            if (actionType === 'save' || actionType === 'lock') {
                closeUI();
            }
        }
    });
}

function closeUI() {
    document.body.classList.add('hidden');
    quill.setText(''); 
    quill.history.clear(); 
    
    fetch(`https://${GetParentResourceName()}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
}

document.onkeyup = (e) => { if (e.key === "Escape") closeUI(); };