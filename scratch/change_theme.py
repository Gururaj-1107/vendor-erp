import os

replacements = {
    '#6C63FF': '#3B82F6',
    '#6c63ff': '#3b82f6',
    '#A855F7': '#06B6D4',
    '#a855f7': '#06b6d4',
    '108, 99, 255': '59, 130, 246',
    '108,99,255': '59,130,246',
}

src_dir = 'd:/Vendor/frontend/src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            for old, new in replacements.items():
                content = content.replace(old, new)
            
            # Handle occurrences of 'purple' strings (e.g. icon colors or classes)
            content = content.replace("'purple'", "'blue'").replace('"purple"', '"blue"')
            content = content.replace("bg-purple-", "bg-blue-").replace("text-purple-", "text-blue-").replace("border-purple-", "border-blue-")
                
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Replaced theme in {file}")

print("Theme replacement complete!")
