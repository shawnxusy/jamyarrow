import os, sys, shutil

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
src = BASE_DIR + "/Jamyarrow/media/timeline/"
dest = BASE_DIR + "/Jamyarrow/apps/timeline/media/"

orig_files = os.listdir(src)
for file_name in orig_files:
    full_file_name = os.path.join(src, file_name)
    if (os.path.isfile(full_file_name)):
        shutil.copy(full_file_name, dest)
