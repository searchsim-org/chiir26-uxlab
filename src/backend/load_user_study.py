from fastapi import APIRouter, HTTPException
import yaml
import random
import glob
import os
from pathlib import Path

router = APIRouter()

# Get the absolute path to the src directory
BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / 'config'

@router.get("/api/v1/loaduserstudy/{id_code}")
async def load_user_study(id_code: str):
    user_study_dir = CONFIG_DIR / 'user_study'
    task_files = glob.glob(str(user_study_dir / '*.yaml'))
    for file_path in task_files:
        with open(file_path, 'r') as file:
            task_data = yaml.safe_load(file)
            if task_data.get('user_study', {}).get('id_code') == id_code:
                survey_file_path = CONFIG_DIR / 'surveys' / os.path.basename(file_path)
                if os.path.exists(survey_file_path):
                    with open(survey_file_path, 'r') as survey_file:
                        survey_data = yaml.safe_load(survey_file)
                        if 'pre_study_questions' in survey_data:
                            return survey_data['pre_study_questions']
                        else:
                            return {"error": "Survey questions not found in the survey data."}
                else:
                    return {"error": "Survey file not found."}
    return {"error": "No matching user study currently available to run."}, 404


@router.get("/api/v1/loadtopics/{id_code}")
async def load_topics(id_code: str):
    user_study_dir = CONFIG_DIR / 'user_study'
    task_files = glob.glob(str(user_study_dir / '*.yaml'))
    for file_path in task_files:
        with open(file_path, 'r') as file:
            task_data = yaml.safe_load(file)
            if task_data.get('user_study', {}).get('id_code') == id_code:
                topics_path = task_data['user_study'].get('topics_path')
                number_of_topics = task_data['user_study'].get('number_of_topics')
                task_type = task_data['user_study'].get('task_type') 
                if topics_path and number_of_topics:
                    full_topics_path = CONFIG_DIR / 'topics' / os.path.basename(topics_path)
                    if os.path.exists(full_topics_path):
                        with open(full_topics_path, 'r') as topics_file:
                            topics_data = yaml.safe_load(topics_file)
                            if 'topics' in topics_data:
                                selected_topics = random.sample(topics_data['topics'], number_of_topics)
                                # Transform the selected topics to match the desired structure
                                formatted_topics = [
                                    {
                                        "id": str(index + 1),  
                                        "title": f"Task N°{index + 1}",
                                        "task_id": topic['num'], 
                                        "description": topic['desc'],  
                                        "taskType": task_type  
                                    }
                                    for index, topic in enumerate(selected_topics)
                                ]
                                return {"topics": formatted_topics}
                            else:
                                return {"error": "Topics not found in the topics data."}
                    else:
                        return {"error": "Topics file not found."}
    return {"error": "No matching user study currently available to run."}, 404


@router.get("/api/v1/loadsearchengine/{id_code}")
async def load_search_engine(id_code: str):
    user_study_dir = CONFIG_DIR / 'user_study'
    task_files = glob.glob(str(user_study_dir / '*.yaml'))
    for file_path in task_files:
        with open(file_path, 'r') as file:
            task_data = yaml.safe_load(file)
            if task_data.get('user_study', {}).get('id_code') == id_code:
                search_engine_data = task_data['user_study'].get('search_engine')
                if search_engine_data:
                    # Extract the search engine information
                    formatted_search_engine = {
                        "type": search_engine_data.get('type'),
                        "api_key": search_engine_data.get('api_key'),
                        "index": search_engine_data.get('index'),
                        "search_properties": search_engine_data.get('search_properties')
                    }
                    return {"search_engine": formatted_search_engine}
                else:
                    return {"error": "Search engine information not found."}
    return {"error": "No matching user study currently available to run."}, 404