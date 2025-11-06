# ⚡ Cheatsheet - Comandos Rápidos

## 🎯 TU COMANDO PRINCIPAL

```bash
git deploy
```
☝️ Este comando hace TODO: sube a GitHub, VPS y despliega el sitio web.

---

## 📋 FLUJO COMPLETO (Copiar y Pegar)

```bash
cd /d/EXTRA/hostinger
git status
git add .
git commit -m "Descripción de los cambios"
git deploy
```

---

## 🔥 COMANDOS MÁS USADOS

| Comando | Qué hace |
|---------|----------|
| `pwd` | Ver dónde estás |
| `cd /d/EXTRA/hostinger` | Ir a tu proyecto |
| `git status` | Ver archivos modificados |
| `git diff` | Ver cambios específicos |
| `git add .` | Agregar todo |
| `git add archivo.html` | Agregar un archivo |
| `git commit -m "msg"` | Guardar cambios |
| `git deploy` | **Desplegar todo** |
| `git log --oneline -5` | Ver últimos commits |
| `git branch` | Ver rama actual |

---

## 🌐 VERIFICAR DESPLIEGUE

### En el Navegador:
```
1. Abrir: https://beristainyasociados.com.ar
2. Presionar: Ctrl + Shift + R
```

### En el VPS:
```bash
ssh root@69.62.95.98
tail -30 /tmp/git_deploy_log.txt
exit
```

---

## 🆘 COMANDOS DE EMERGENCIA

### Descartar cambios no guardados:
```bash
git checkout -- archivo.html  # Un archivo
git reset --hard HEAD          # Todo (¡cuidado!)
```

### Forzar redespliegue en VPS:
```bash
ssh root@69.62.95.98
echo "" | /home/usuario/beristainAsociados/hooks/post-receive
exit
```

### Recrear alias deploy:
```bash
git config --global alias.deploy '!git push origin master && git push vps master'
```

---

## 🎯 ATAJOS DE TECLADO

### VSCode:
- `Ctrl + ñ` → Terminal
- `Ctrl + S` → Guardar
- `Ctrl + F` → Buscar

### Navegador:
- `Ctrl + Shift + R` → Recargar sin caché
- `Ctrl + Shift + N` → Incógnito
- `F12` → DevTools

---

## ✅ CHECKLIST RÁPIDO

- [ ] `git add .`
- [ ] `git commit -m "mensaje"`
- [ ] `git deploy`
- [ ] `Ctrl + Shift + R` en navegador
- [ ] ¡Verificado! ✅

---

## 📂 RUTAS IMPORTANTES

**Local:**
```
/d/EXTRA/hostinger
```

**VPS:**
```
Log: /tmp/git_deploy_log.txt
Web: /var/www/beristainAsociados/frontend
Repo: /home/usuario/beristainAsociados/.git
```

**Online:**
```
https://beristainyasociados.com.ar
```

---

## 🔧 CONFIGURACIÓN

**Remotos:**
```bash
origin → GitHub
vps    → Hostinger
all    → Ambos
```

**Comandos equivalentes:**
```bash
git deploy              # Recomendado
git push all master     # Alternativa
```

---

Ver guía completa en: `GUIA_PERSONALIZADA.md`
