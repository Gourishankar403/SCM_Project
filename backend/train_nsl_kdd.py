import os
import pickle
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

COLUMNS = [
    'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
    'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
    'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
    'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
    'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
    'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
    'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
    'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
    'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
    'dst_host_rerror_rate', 'dst_host_srv_rerror_rate', 'label', 'difficulty'
]

CATEGORICAL_FEATURES = ['protocol_type', 'service', 'flag']
NUMERIC_FEATURES = [
    col for col in COLUMNS if col not in CATEGORICAL_FEATURES + ['label', 'difficulty']
]

def map_label(label: str) -> int:
    return 0 if label.strip().lower() == 'normal' else 1

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    train_path = os.path.join(base_dir, 'KDDTrain+_20Percent.txt')
    test_path = os.path.join(base_dir, 'KDDTest+.txt')
    
    print('Loading NSL-KDD dataset...')
    train_df = pd.read_csv(train_path, names=COLUMNS)
    test_df = pd.read_csv(test_path, names=COLUMNS)
    
    X_train = train_df[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y_train = train_df['label'].apply(map_label)
    
    X_test = test_df[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y_test = test_df['label'].apply(map_label)
    
    print(f'Training set size: {len(X_train)} samples')
    print(f'Test set size: {len(X_test)} samples')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES),
            ('num', 'passthrough', NUMERIC_FEATURES)
        ]
    )
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', clf)
    ])
    
    print('Fitting RandomForest model on NSL-KDD...')
    pipeline.fit(X_train, y_train)
    
    print('Evaluating model on test set...')
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f'Test Accuracy: {acc:.4f}')
    print('\nClassification Report:')
    print(classification_report(y_test, y_pred, target_names=['Normal (0)', 'Attack (1)']))
    
    output_dir = os.path.join(base_dir, 'models')
    os.makedirs(output_dir, exist_ok=True)
    model_output_path = os.path.join(output_dir, 'nsl_kdd_pipeline.pkl')
    
    with open(model_output_path, 'wb') as f:
        pickle.dump(pipeline, f)
    print(f'Saved NSL-KDD pipeline to {model_output_path}')

if __name__ == '__main__':
    main()
