from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB

def analyse_resume(resumeText, emailBody, emailSubject):
    filepath_dict = {'resumeData':   'data/resume_extractor/resume.txt'}
    df_list = []
    for source, filepath in filepath_dict.items():
        df = pd.read_csv(filepath, names=['sentence', 'label'], sep='\t')
        df['source'] = source  # Add another column filled with the source name
        df_list.append(df)

    df = pd.concat(df_list)
    for source in df['source'].unique():
        df_source = df[df['source'] == source]
        sentences = df_source['sentence'].values
        labels = df_source['label'].values
        sentences_train, sentences_test, labels_train, labels_test = train_test_split(sentences, labels, test_size=0.25, random_state=400)
        vectorizer = CountVectorizer()
        vectorizer.fit(sentences_train)
        X_train = vectorizer.transform(sentences_train)
        X_test  = vectorizer.transform(sentences_test)
        clf = LogisticRegression()
        clf.fit(X_train, labels_train)
        score = clf.score(X_test, labels_test)
        X_train = vectorizer.transform(sentences)
        classifier=GaussianNB()
        classifier.fit(X_train.toarray(), labels)
        vp_rt=classifier.predict(vectorizer.transform([resumeText]).toarray())
        if emailBody is not None:
            vp_eb=classifier.predict(vectorizer.transform([emailBody]).toarray())
        if emailBody is not None:
            vp_es=classifier.predict(vectorizer.transform([emailSubject]).toarray())

        if (vp_rt[0] == 1):
            print("This is a resume")

        #print('Accuracy for {} data: {:.4f}'.format(source, score))
