
import sys
import re

def resolve_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Improved regex to handle empty blocks and varying newlines
    # HEAD block: content between HEAD and =======
    # Remote block: content between ======= and >>>>>>>
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)=======\n(.*?)\n>>>>>>> .*?\n', re.DOTALL)
    
    def replacer(match):
        # Return only the HEAD content
        head_content = match.group(1)
        return head_content

    new_content = pattern.sub(replacer, content)

    # Check for any remaining markers
    if '<<<<<<<' in new_content:
        print(f"Warning: Residual conflict markers in {filepath}")
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Resolved conflicts in {filepath}")

if __name__ == "__main__":
    for f in sys.argv[1:]:
        resolve_file(f)
